var playerService = require('../services/player.service');
var Deck = require('../deck/deck');
var Pile = require('./pile');
var balance = require('../math/balance');

function Game() {
    var playing = false;

    var self = this;

    var turn = 0;

    var pile = new Pile();

    var finalRound = false;

    this.isPlaying = function() {
        return playing;
    };

    this.start = function() {
        deck = new Deck();

        var players = playerService.getAllPlayers();
        var nPlayers = playerService.getNPlayers();
        deck.generateDeck(balance.numberOfCards(nPlayers), function(deck) {
            console.log('deck ready, with size ' + deck.remaining());
        });

        for (var p in players) {
            var player = players[p];

            self.drawHand(player);
        }

        pile.init(deck.drawCard());

        playing = true;
    };

    this.finalRound = function() {
        finalRound = true;
    };

    this.playCard = function(playerID, c, p) {
        if (playerService.getPlayerByIndex(turn).playerID !== playerID || !playerService.getPlayer(playerID).active) {
            return;
        }
        var player = playerService.getPlayer(playerID);

        var card = player.playCard(c);

        switch (p) {
            case 'SCORE':
                endTurn(player, pile.play(card));
                break;
            case 'EFFECT':
                if (!pile.playEffect(card)) {
                    player.addCard(card);
                }
                break;
        };
    };

    var endTurn = function (player, score) {
        player.score(score);
        if (finalRound) {
            player.active = false;
        }
        self.drawHand(player);

        // start snap timer : modifiedCard.snapTime.
        turn = (turn === playerService.getNPlayers() -1) ? turn = 0 : turn+1;
    };

    this.drawHand = function(player) {
        var handSize = player.getHand().length;

        for (var i=handSize; i<balance.MAX_HAND; i++) {
            var card = deck.drawCard();
            if (card) {
                player.addCard(card);
            }
            if (deck.remaining() === 0) {
                self.finalRound();
            }
        };
    };
};

module.exports = Game;
