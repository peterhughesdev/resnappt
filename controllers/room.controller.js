var deckBuilder = require('../services/deck.service.js');
var diffusion = require('../services/diffusion.service.js');
var playerService = require('../services/player.service.js');

/*
 * Create a room with just the basics. Once players are ready, we will generate the deck, etc.
 */
exports.initRoom = function() {
    diffusion.init()
    .on('playerJoined', addPlayer)
    .on('playerLeft', removePlayer)
    .on('playerCommand', playerCommand);
};

/*
 * Now finalise everything, generate the deck and such.
 */
var finaliseRoom = function() {
    deckBuilder.generateDeck(10);
};

var addPlayer = function(playerID) {
    playerService.createPlayer(playerID);
};

var removePlayer = function(playerID) {
    playerService.removePlayer(playerID);
};

var playerCommand = function(playerID, command, args) {
    console.log(message);
    switch (message) {
    case 'PLAY':
        playerService.playCard(playerID, args);
        break;
    case 'READY':
        playerService.ready(playerID);
        break;
    };
};
