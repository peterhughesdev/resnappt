var playerService = require('./services/player.service');
var Game = require('./game/game');

var game = new Game();

var diffusion = null;

exports.initRoom = function(df) {
    diffusion = df;
    diffusion.init()
    .on('playerJoined', addPlayer)
    .on('playerLeft', removePlayer)
    .on('playerCommand', playerCommand);
};

var finaliseRoom = function() {
    game.on('updatePile', updatePile)
    .on('updateTurn', updateTurn)
    .on('updateHand', updateHand)
    .on('updateEffects', updateEffect)
    .on('updateDeck', updateDeck)
    .start();
};

var updatePile = function(card) {
    diffusion.topOfPile(card);
};

var updateTurn = function(playerID) {
    diffusion.nextTurn(playerID);
};

var updateHand = function(player) {
    diffusion.drawCard(player);
};

var updateEffect = function(effects) {
    diffusion.updateEffectsPile(effects);
};

var updateDeck = function(remaining) {
    diffusion.updateDeck(remaining);
};

var playerScore = function(player) {
    diffusion.updateScore(player);
};

var addPlayer = function(playerID) {
    if (!game.isPlaying()) {
        playerService.createPlayer(playerID)
        .on('ready', playerReady)
        .on('score', playerScore);
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
        game.snap(playerID);
        break;
    };
};
