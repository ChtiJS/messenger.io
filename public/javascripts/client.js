// jQuery fix

$ = document.querySelector.bind(document);
Element.prototype.on = Element.prototype.addEventListener;



// Socket opening + DOM element caching

var socket = io.connect('http://localhost:3000'),
    $messages = $('.messages'),
    $form = $('.send'),
    $input = $('.send input');



// Message zone DOM handling

$messages.add = function(data) {
    $messages.innerHTML += '<li><span class="user">' + data.name + '</span>' + data.message + '</li>';
};



// Login

var name,
    error = '',

    userPrompt = function() {
        name = prompt(error + (error.length ? "\n" : '') + 'Type in your name :');

        if ((! name) || (name == 'null')) { // stupid bug
            error = 'No name provided !';
            userPrompt();
        } else {
            socket.emit('loginRequest', {
                name: name
            });
        }
    };

socket.on('loginResponse', function(data) {
    if (! data.error.length) {
        name = data.name;
    } else {
        error = data.error;
        userPrompt();
    }
});

userPrompt();



// Socket events

$('.send').on('submit', function(event) {
    event.preventDefault();

    socket.emit('sendMessage', {
        message: $input.value
    });

    $input.value = '';
});

socket.on('broadcast', function(data) {
    $messages.add(data);
});