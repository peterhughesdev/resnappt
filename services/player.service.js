var players = {};

exports.createPlayer = function(sessionID) {
    var player = {
        session : sessionID,
        score : 0,
        hand : {}
    };
    if (!players[sessionID]) {
        players[sessionID] = player;
    }
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
