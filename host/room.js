var deckBuilder = require('./services/deck.service.js');
var diffusion = require('./services/diffusion.service.js');
var playerService = require('./services/player.service.js');

exports.initRoom = function() {
    diffusion.init()
    .on('playerJoined', addPlayer)
    .on('playerLeft', removePlayer)
    .on('playerCommand', playerCommand);
};

var finaliseRoom = function() {
    deckBuilder.generateDeck(10);
};

var addPlayer = function(playerID) {
    playerService.createPlayer(playerID)
    .on('ready', playerReady);
};

var playerReady = function(playerID) {
    // do something once each player is ready.
    // when everyone is ready, we start the game.
};

var removePlayer = function(playerID) {
    playerService.removePlayer(playerID);
};

var playerCommand = function(playerID, command, args) {
    switch (message) {
    case 'PLAY':
        playerService.getPlayer(playerID).playCard(args);
        break;
    case 'READY':
        playerService.getPlayer(playerID).ready();
        break;
    };
};
