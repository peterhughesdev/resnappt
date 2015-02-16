var Player = require('../player/player');

var players = {};

exports.createPlayer = function(sessionID) {
    var player = new Player(sessionID);

    if (!players[sessionID]) {
        players[sessionID] = player;
    }
    return player;
};

exports.getPlayer = function(sessionID) {
    return players[sessionID];
};

exports.removePlayer = function(sessionID) {
    delete players[sessionID];
};

exports.getAllPlayers = function() {
    return players;
};
