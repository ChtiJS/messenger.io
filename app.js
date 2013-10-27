// Setup

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    path = require('path'),
    users = [];

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(require('stylus').middleware(__dirname + '/public'));
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.get('/', function(req, res) {
    res.render('index', { title: 'Messenger.io' });
});

server.listen(app.get('port'));



io.sockets.on('connection', function(socket) {
    // Login

    socket.on('loginRequest', function(data) {
        var error = '';

        if (users.indexOf(data.name) > -1) {
            error = 'Name already taken !'
        } else {
            users.push(data.name);
            socket.set('username', data.name, function() {
                socket.emit('broadcast', {
                    name: null,
                    message: 'Welcome! Press enter to start chatting.'
                });

                io.sockets.emit('broadcast', {
                    name: null,
                    message: data.name + ' has joined'
                })
            });
        }

        socket.emit('loginResponse', {
            name: data.name,
            error: error
        });
    });



    // Message relay

    socket.on('sendMessage', function(data) {
        socket.get('username', function(err, name) {
            data.name = name;
            io.sockets.emit('broadcast', data);
        });
    });



    // Logout

    socket.on('disconnect', function() {
        socket.get('username', function(err, name) {
            if (name) {
                io.sockets.emit('broadcast', {
                    name: null,
                    message: name + ' has disconnected'
                });

                ((nameIndex = users.indexOf(name)) > -1) && users.splice(nameIndex, 1);
            }
        });
    });
});