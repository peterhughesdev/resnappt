var Player = require('../player/player');

var players = [];

exports.createPlayer = function(sessionID) {
    var player = new Player(sessionID);

    if (!getPlayer(sessionID)) {
        players[players.length] = player;
        console.log('Adding player '+sessionID);
    }
    return player;
};

exports.addSpectator = function(sessionID) {
    console.log('Adding spectator');
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

exports.removePlayer = function(sessionID) {
    console.log('Removing player '+sessionID);
    for (var p in players) {
        if (players[p].playerID === sessionID) {
            players.splice(p,1);
        }
    }
};

exports.getAllPlayers = function() {
    return players;
};

exports.getNPlayers = function() {
    return players.length;
};
