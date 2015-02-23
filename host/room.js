var playerService = require('./services/player.service');
var Game = require('./game/game');

var game = new Game();

var diffusion = null;

// a list of playerIDs viewing the rooms
var interest = [];

exports.initRoom = function(df) {
    diffusion = df;
    diffusion.init()
    .on('playerJoined', registerInterest)
    .on('playerLeft', removePlayer)
    .on('playerCommand', playerCommand);
};

var finaliseRoom = function() {
    var players = [];

    var registered = playerService.getAllPlayers();

    for (var p in registered) {
        players[players.length] = { playerID : registered[p].playerID, turn : registered[p].turn };
    }

    diffusion.startGame(players);

    game.on('updatePile', diffusion.topOfPile)
    .on('updateTurn', diffusion.nextTurn)
    .on('updateHand', diffusion.drawCard)
    .on('updateEffects', diffusion.updateEffectsPile)
    .on('updateDeck', diffusion.updateDeck)
    .on('gameEnd', diffusion.scoreSummary)
    .on('snapTimer', diffusion.snapTimer)
    .on('playerSnapped', diffusion.publishSnapper)
    .start();
};

var endGame = function() {
    game.end();
    diffusion.cleanup();
    diffusion.start();
    game = new Game();
    interest = [];
    playerService.removeAllPlayers();
};

var registerInterest = function(playerID) {
    interest[interest.length] = playerID;
};

var addPlayer = function(playerID) {
    var turn = playerService.getNPlayers();
    if (!game.isPlaying()) {
        playerService.createPlayer(playerID, turn)
        .on('score', diffusion.updateScore);
        diffusion.registerPlayer(playerID, turn);
        checkReadiness();
    }
    else {
        playerService.addSpectator(playerID);
        diffusion.registerSpectator(playerID);
    }
};

var checkReadiness = function() {
    console.log('interested parties = '+interest.length);
    console.log('registered players = '+playerService.getNPlayers());
    if ((playerService.getNPlayers() === interest.length && playerService.getNPlayers() > 1)
      || playerService.getNPlayers() === 4) {
        finaliseRoom();
    }

};

var removePlayer = function(playerID) {
    interest.splice(interest.indexOf(playerID),1);
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
        addPlayer(playerID);
        break;
    case 'SNAP':
        game.snap(playerID);
        break;
    };
};
