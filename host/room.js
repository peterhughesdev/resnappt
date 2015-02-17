var playerService = require('./services/player.service');
var Game = require('./game/game');

var game = new Game();

exports.initRoom = function(diffusion) {
    diffusion.init()
    .on('playerJoined', addPlayer)
    .on('playerLeft', removePlayer)
    .on('playerCommand', playerCommand);
};

var finaliseRoom = function() {
    game.start();
};

var addPlayer = function(playerID) {
    if (!game.isPlaying()) {
        playerService.createPlayer(playerID)
        .on('ready', playerReady);
    }
    else {
        playerService.addSpectator(playerID);
    }
};

var playerReady = function(playerID) {
    console.log(playerID + ' ready!');

    var players = playerService.getAllPlayers();

    var allReady = true;
    for (var p in players) {
        if (!players[p].isReady()) {
            allReady = false;
        }
    }

    if (allReady) {
        finaliseRoom();
    }

};

var removePlayer = function(playerID) {
    playerService.removePlayer(playerID);
};

var playerCommand = function(playerID, data) {
    switch (data.command) {
    case 'PLAY':
        game.playCard(playerID, data.card, data.pile);
        break;
    case 'READY':
        playerService.getPlayer(playerID).ready();
        break;
    case 'SNAP':
        playerService.getPlayer(playerID).snap();
        break;
    };
};
