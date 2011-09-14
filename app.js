var express = require('express');
var app = express.createServer();

var userCount = 0;
var players = {};

var sessionSecrets = {
    secret : 'secret',
    key: 'express.sid'
};

app.configure(function(){
    app.use(express.cookieParser());
    app.use(express.session(sessionSecrets));
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);    
});

app.use(express.static(__dirname + '/public'));

var getJsonPlayers = function(req, res) {
    res.json(players);
};

app.get("/json/players", getJsonPlayers);

app.listen(process.env.C9_PORT);


var onDisconnect = function() {
    userCount = userCount - 1;
    io.sockets.emit('updateUserCount', userCount);
};

var onAddPlayer = function(player) {
    if (players[player.name]) {
        socket.emit('promptName');
    } else {
        players[player.name] = player;
        io.sockets.emit('updateGame', players);
    }
};

var onGetPlayers = function() {
    io.sockets.emit('getPlayers', players);
};

var onRemovePlayer = function(playerName) {
    delete players[playerName];
    io.sockets.emit('updateGame', players);
};

var onAttackPlayer = function(attackerName, playerName) {
    if (attackerName && playerName) {
        var target = players[playerName];
        var attacker = players[attackerName];
        if (target.points > 0) {
            attacker.points = attacker.points + 1;
            target.points = target.points - 1;
            io.sockets.emit('updateGame', players);
        }
    }
};

var onConnection = function(socket) {
    userCount = userCount + 1;
    io.sockets.emit('updateUserCount', userCount);
    
    socket.emit('updateGame', players);
    
    socket.on('addPlayer', function(player) {
        if (players[player.name]) {
            socket.emit('promptName');
        } else {
            players[player.name] = player;
            io.sockets.emit('updateGame', players);
        }
    });
    
    socket.on('getPlayers', onGetPlayers);
    socket.on('removePlayer', onRemovePlayer);
    socket.on('attack', onAttackPlayer);
    socket.on('disconnect', onDisconnect);
};

var io = require('socket.io').listen(app);
io.sockets.on('connection', onConnection);