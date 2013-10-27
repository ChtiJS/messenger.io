// jQuery fix

$ = document.querySelector.bind(document);
Element.prototype.on = Element.prototype.addEventListener;



// Notification permission handler

window.notify = function(name, message) {
    if (window.Notification) {
        // If permission to display notifications is neither granted nor denied, we request it
        if ((Notification.permission != 'granted') && (Notification.permission != 'denied')) {
            Notification.requestPermission(function(permission) {
                console.log(permission);
                Notification.permission = permission;
            });
        }

        // If permission is granted, we show our notification
        if ((Notification.permission == 'granted') && name) {
            var notif = new Notification(name, {
                body: message,
                icon: 'https://pbs.twimg.com/profile_images/3565788553/79ed17e02ee909628ea2ea4b393f8c1a_bigger.png'
            });
        }
    }
};



// PageVisibility API universalization

document.isHidden = function() {
    if (document.hidden !== undefined) {
        return document.hidden;
    }

    if (document.webkitHidden !== undefined) {
        return document.webkitHidden;
    }

    if (document.mozHidden !== undefined) {
        return document.mozHidden;
    }

    if (document.msHidden !== undefined) {
        return document.msHidden;
    }

    return false;
};



// Socket opening && jQuery object caching

var socket = io.connect('http://localhost:3000'),
    $messages = $('.messages'),
    $form = $('.send'),
    $input = $('.send input');



// Message zone DOM handling

$messages.add = function(data) {
    $messages.innerHTML += '<dt' + ((data.name === null) ? ' class="system">*' : '>' + data.name + ':') + '</dt><dd>' + data.message + '</dd>';

    if (document.isHidden() && data.name) {
        window.notify(data.name, data.message);
    }
};



// Focus on input when user presses Enter
// Also asks for notification permission

$('body').on('keydown', function(e) {
    if (e.keyCode == 13) {
        if (! $('[name=send]').value) {
            e.preventDefault();
            window.notify();
        }

        $('[name=send]').focus();
    }
});



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