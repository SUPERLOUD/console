
(function() {
    var pressedKeys = {};
    var lastkeypressed;

    function setKey(event, status) {
        var code = event.keyCode;
        var key;

        switch(code) {
        case 32:
            key = 'SPACE'; event.preventDefault();break;
        case 37:
            key = 'LEFT'; event.preventDefault();break;
        case 38:
            key = 'UP'; event.preventDefault();break;
        case 39:
            key = 'RIGHT'; event.preventDefault();break;
        case 40:
            key = 'DOWN'; event.preventDefault();break;
        default:
            // Convert ASCII codes to letters
            key = String.fromCharCode(code);
        }

        pressedKeys[key] = status;
        
        if (status == false) lastkeypressed = key;
    }

    document.addEventListener('keydown', function(e) {
        setKey(e, true);
    });

    document.addEventListener('keyup', function(e) {
        setKey(e, false);
    });

    window.addEventListener('blur', function() {
        pressedKeys = {};
    });

    window.input = {
        isDown: function(key) {
            return pressedKeys[key.toUpperCase()];
        },
        getlastkey: function() {
            return lastkeypressed;
        }
    };
})();
