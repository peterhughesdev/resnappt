var Player = require('../player/player');

var players = [];

var turn = 0;

exports.createPlayer = function(sessionID, turnIndex) {
    var player = new Player(sessionID, turnIndex);

    if (!getPlayer(sessionID)) {
        players[players.length] = player;
        console.log('Adding player '+sessionID);
    }
    return player;
};

exports.addSpectator = function(sessionID) {
    console.log('Adding spectator');
    return {ready:function() { console.log('spectator called ready');}};
};

var getPlayer = function(sessionID) {
    for (var p in players) {
        if (players[p].playerID === sessionID) {
            return players[p];
        }
    }
    return null;
};

exports.getPlayer = getPlayer;

exports.getPlayerByIndex = function(i) {
    return players[i];
};

exports.getCurrentPlayer = function() {
    return players[turn];
};

exports.getPreviousPlayer = function() {
    var prev = (turn === 0) ? players.length : turn - 1;
    return players[prev];
};

exports.nextTurn = function() {
    var nPlayers = players.length;
    turn = (turn === nPlayers - 1) ? 0 : turn + 1;
    return players[turn];
};

exports.removePlayer = function(sessionID) {
    console.log('Removing player '+sessionID);
    for (var p in players) {
        if (players[p].playerID === sessionID) {
            players.splice(p,1);
        }
    }
};

exports.removeAllPlayers = function() {
    for (var p in players) {
        delete players[p];
    }
    players = [];
    turn = 0;
};

exports.getAllPlayers = function() {
    return players;
};

exports.getNPlayers = function() {
    return players.length;
};
