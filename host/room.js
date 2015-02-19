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
    game.on('updatePile', diffusion.topOfPile)
    .on('updateTurn', diffusion.nextTurn)
    .on('updateHand', diffusion.drawCard)
    .on('updateEffects', diffusion.updateEffectsPile)
    .on('updateDeck', diffusion.updateDeck)
    .on('endGame', diffusion.scoreSummary)
    .on('snapTimer', diffusion.snapTimer)
    .on('playerSnapped', diffusion.publishSnapper)
    .start();
};

var endGame = function() {
    game.end();
    diffusion.cleanup();
    diffusion.start();
    game = new Game();
};

var addPlayer = function(playerID) {
    if (!game.isPlaying()) {
        playerService.createPlayer(playerID)
        .on('ready', checkReadiness)
        .on('score', diffusion.updateScore);
    }
    else {
        playerService.addSpectator(playerID);
    }
};

var checkReadiness = function(playerID) {
    console.log(playerID + ' ready!');

    var players = playerService.getAllPlayers();

    var allReady = true;
    for (var p in players) {
        if (!players[p].isReady()) {
            allReady = false;
        }
    }
    if (playerService.getNPlayers() < 2) {
        allReady = false;
    }

    if (allReady) {
        finaliseRoom();
    }

};

var removePlayer = function(playerID) {
    playerService.removePlayer(playerID);

    if (playerService.getNPlayers() < 1) {
        endGame();
    } else {
        checkReadiness();
    }
};

var playerCommand = function(playerID, data) {
    switch (data.command) {
    case 'PLAY':
        game.playCard(playerID, data.message.card, data.message.pile);
        break;
    case 'READY':
        var player = playerService.getPlayer(playerID);
        if (player) {
            player.ready();
        } else {
            console.log('Unregistered player called ready');
        }
        break;
    case 'SNAP':
        game.snap(playerID);
        break;
    };
};
