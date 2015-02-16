var diffusion = require('./services/diffusion.service');
var playerService = require('./services/player.service');
var Deck = require('./deck/deck');
var balance = require('./math/balance');

// we may want to store the deck somewhere else? not sure yet.
// alternatively, it might make sense to store the players here too.
var deck = null;

exports.initRoom = function() {
    diffusion.init()
    .on('playerJoined', addPlayer)
    .on('playerLeft', removePlayer)
    .on('playerCommand', playerCommand);
};

var finaliseRoom = function() {
    deck = new Deck();
    deck.generateDeck(10, function(deck) {
        console.log('deck ready');
    });
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

var playerCommand = function(playerID, data) {
    switch (data.command) {
    case 'PLAY':
        playerService.getPlayer(playerID).playCard(data.args);
        break;
    case 'READY':
        playerService.getPlayer(playerID).ready();
        break;
    case 'SNAP':
        playerService.getPlayer(playerID).snap();
        break;
    };
};
