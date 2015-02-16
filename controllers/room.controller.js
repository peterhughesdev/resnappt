var deckBuilder = require('../services/deck.service.js');
var diffusion = require('diffusion');

var session = null;

var deck = null;
var players = null;

/*
 * Create a room with just the basics. Once players are ready, we will generate the deck, etc.
 */
exports.initRoom = function() {
    var options = {
        host : 'quickwittedAres.cloud.spudnub.com',
        ssl : false,
        credentials : {
            principal : 'host',
            password : 'ResnapptTheGathering'
        }
    };

    session = diffusion.connect(options);

    session.on('connect', function() {
        console.log('diffusion connected');
        session.subscribe('sessions/.*', watchPlayers);
    });
};

/*
 * Now finalise everything, generate the deck and such.
 */
var finaliseRoom = function() {
    deck = deckBuilder.generateDeck(10);
};

var createTopicTree = function() {
    if (session.isConnected()) {
        // add topics that we need here
        var topics = session.topics;

        topics.add('turn');
    }
};

var watchPlayers = function(message, topic) {
    console.log('Topic ' + topic);
    console.log('Message ' + message);
};

