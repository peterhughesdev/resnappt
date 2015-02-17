var playerService = require('../services/player.service');
var Deck = require('../deck/deck');
var Pile = require('./pile');
var balance = require('../math/balance');

var events = require('events');

function Game() {
    var self = this;

    var emitter = new events.EventEmitter();

    var playing = false;
    var turn = 0;
    var nTurns = 0;

    var deck = new Deck();
    var pile = new Pile();

    var finalRound = false;

    var snapping = false;
    var snappers = [];

    this.on = function(evt, callback) {
        emitter.on(evt, callback);
        return self;
    };

    this.isPlaying = function() {
        return playing;
    };

    this.start = function() {
        var players = playerService.getAllPlayers();
        var nPlayers = playerService.getNPlayers();
        deck.generateDeck(balance.numberOfCards(nPlayers), function(deck) {
            console.log('deck ready, with size ' + deck.remaining());

            for (var p in players) {
                var player = players[p];

                self.drawHand(player);
            }

            pile.init(deck.drawCard());
            emitter.emit('updatePile', pile.getTop());

            playing = true;

        });
    };

    this.finalRound = function() {
        finalRound = true;
    };

    this.playCard = function(playerID, c, p) {
        if (playerService.getPlayerByIndex(turn).playerID !== playerID || !playerService.getPlayer(playerID).active || snapping) {
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
                } else {
                    emitter.emit('updateEffects', pile.getEffects());
                }
                break;
        };
    };

    var endTurn = function (player, state) {
        emitter.emit('updatePile', pile.getTop());

        player.score(state.score);
        if (state.prevScore) {
            var previousIndex = turn - 1;
            if (previousIndex < 0) {
                previousIndex += playerService.getNPlayers();
            }
            playerService.getPlayerByIndex(previousIndex).score(state.score);
        }
        if (finalRound) {
            player.active = false;
        }

        emitter.emit('updateEffects', pile.getEffects());

        self.drawHand(player);

        // start snap timer
        if (state.snap) {
            snapping = true;
            snappers = [];
            setTimeout(function() {
                snapping = false;
                nextTurn(state);
            }, 5000);
        } else {
            nextTurn(state);
        }
    };

    this.snap = function(playerID) {
        if (!snapping) {
            return;
        }
        snappers[snappers.length] = playerID;
    };

    var nextTurn = function (state) {
        if (state.snap && snappers.length > 0) {
            var winner = playerService.getPlayer(snappers[0]);
            if (state.top.modrune == state.played.modrune) {
                winner.score(Math.ceil(state.score / 2.0));
            } else {
                winner.score(-1*Math.ceil(state.score / 2.0));
            }
        }

        turn = (turn === playerService.getNPlayers() -1) ? turn = 0 : turn+1;
        emitter.emit('updateTurn', playerService.getPlayerByIndex(turn).playerID);
        nTurns++;
    };

    this.drawHand = function(player) {
        var handSize = player.getHand().length;

        for (var i=handSize; i<balance.MAX_HAND; i++) {
            var card = deck.drawCard();
            if (card) {
                player.addCard(card);
                emitter.emit('updateHand', player);
                emitter.emit('updateDeck', deck.remaining());
            }
            if (deck.remaining() === 0) {
                self.finalRound();
            }
        };
    };
};

module.exports = Game;
