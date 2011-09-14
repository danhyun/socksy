jQuery('document').ready(function($) {
    var socket = io.connect('http://socksy.dhyun.cloud9ide.com', {
        'sync disconnect on unload': false
    });
    var users = $('#connectionCounter');
    var article = $('article');
    var me = {};

    $('#playerName').change(function() {
        var nameInput = $(this);
        var pname = nameInput.val();
        pname = $.trim(pname);
        if (pname) {
            me = {
                name: pname,
                points: 5
            };
            $('#warn').hide();
            socket.emit('addPlayer', me);
            nameInput.attr('disabled', true);
        }
        else {
            nameInput.val('');
        }
    });
    
    var onPromptName = function() {
         var input = $('#playerName');
         input.val('');
         input.removeAttr('disabled');
         input.focus();
         var warning = $('#warn');
         warning.html('<span>Please select a different name</span>');
         warning.show();
    };
    
    socket.on('promptName', onPromptName);
    
    var attack = function() {
        if (me.name !== this.id) {
            socket.emit('attack', me.name, this.id);
        }
    };
    
    $('.user:not(.me)').live('click', attack);
    
    var onUpdateGame = function(data) {
            $('.user').remove();
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
    
                    var thisPlayer = data[key];
                    var playerdiv = $('div#' + thisPlayer.name);
                    if (playerdiv.length) {}
                    else {
                        info = $('<span/>', {
                            html: thisPlayer.name + "<br/>" + thisPlayer.points
                        });
                        
                        playerdiv = $('<div/>', {
                            id: thisPlayer.name,
                            html: info
                        });
                        playerdiv.addClass('user');
                        if (me && me.name === thisPlayer.name){
                            playerdiv.addClass('me');
                        }
                        article.append(playerdiv);
                    }
                }
            }
        };
    socket.on('updateGame', onUpdateGame);

    var onUpdateUserCount = function(userCount) {
            users.text(userCount);
        };
    socket.on('updateUserCount', onUpdateUserCount);

    var removeMe = function() {
            if (me.name) {
                socket.emit('removePlayer', me.name);
            }
    };

    window.onbeforeunload = removeMe;
});