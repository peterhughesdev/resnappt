var playerService = require('../services/player.service');
var Deck = require('../deck/deck');
var Pile = require('./pile');
var State = require('./state');
var balance = require('../math/balance');

var events = require('events');

function Game() {
    var self = this;

    var emitter = new events.EventEmitter();

    var playing = false;
    var player = null;

    var deck = new Deck();
    var pile = new Pile();
    var state = new State();

    var finalRound = false;

    var snapping = false;
    var snapper = null;
    var snapInterval = null;

    this.on = function(evt, callback) {
        emitter.on(evt, callback);
        return self;
    };

    this.isPlaying = function() {
        return playing;
    };

    this.start = function() {
        deck = new Deck();
        pile = new Pile();
        state = new State();
        finalRound = false;
        snapping = false;
        snapper = null;
        snapTimer = null;

        var nPlayers = playerService.getNPlayers();
        deck.generateDeck(balance.numberOfCards(nPlayers), function(deck) {
            console.log('deck ready, with size ' + deck.remaining());

            var players = playerService.getAllPlayers();
            for (var p in players) {
                self.drawHand(players[p]);
            }

            pile.init(deck.drawCard());
            emitter.emit('updatePile', pile.getTop());

            playing = true;

            player = playerService.getCurrentPlayer();
            emitter.emit('updateTurn', player.playerID);
        });
    };

    var scoreSummary = function() {
        var finalScores = [];
        var players = playerService.getAllPlayers();
        for (var p in players) {
            var playerID = players[p].playerID;
            var score = players[p].getScore();
            finalScores[finalScores.length] = { playerID : playerID, score : score };
        }
        emitter.emit('gameEnd', finalScores);
    };

    this.end = function() {
        scoreSummary();
        playerService.removeAllPlayers();
    };

    this.finalRound = function() {
        finalRound = true;
    };

    this.playCard = function(playerID, c, p) {
        if (!state.isPlaying()) {
            console.log('card played not in play phase');
            return;
        }

        if (!player || player.playerID !== playerID) {
            console.log('Not player '+playerID+' turn');
            return;
        }

        var card = player.playCard(c);

        switch (p) {
            case 'SCORE':
                pile.play(card, true);
                state.endTurn();
                endTurn(player);
                break;
            case 'EFFECT':
                // don't let a player play his last card as an effect.
                if (player.getHand().length > 0) {
                    if (!pile.playEffect(card)) {
                        player.addCard(card);
                    } else {
                        emitter.emit('updateEffects', pile.getEffects());
                    }
                }
                break;
        };
    };

    var allPlayersFinished = function() {
        var players = playerService.getAllPlayers();

        for (var p in players) {
            if (!players[p].finished) {
                return false;
            }
        }
        return true;
    };

    var endTurn = function (player) {
        if (!state.turnEnded()) {
            console.log('ending turn not in incorrect phase');
        }

        emitter.emit('updatePile', pile.getTop());

        player.addScore(pile.getState().score);
        if (pile.getState().duplication) {
            playerService.getPreviousPlayer().addScore(pile.getState().score);
        }
        if (pile.getState().riposte && deck.remaining() > 0) {
            // immediately draw a new card upon Riposte.
            pile.play(deck.drawCard(), false);
            emitter.emit('updatePile', pile.getTop());
        }
        if (finalRound) {
            player.finished();
            if(allPlayersFinished()){
                state.endGame();
                console.log('Game Finished');
                self.end();
                return;
            }
        }

        emitter.emit('updateEffects', pile.getEffects());

        state.startSnap();
        // start snap timer
        if (!pile.getState().guard) {
            snapping = true;
            snapper = null;
            snapTimer = 5;
            snapInterval = setInterval(function() {
                emitter.emit('snapTimer', snapTimer);
                if (snapTimer < 1) {
                    snapping = false;
                    clearInterval(snapInterval);
                    snapScoring();
                }
                snapTimer--;
            }, 1000);
        } else {
            state.endSnap();
            nextTurn();
        }
    };

    this.snap = function(playerID) {
        if (state.isSnapPhase() && playerService.getPlayer(playerID).canSnap()) {
            snapping = false;
            snapper = playerID;
            clearInterval(snapInterval);
            snapScoring();
            emitter.emit('playerSnapped', playerID);
        }
    };

    var snapScoring = function () {
        if (state.isSnapPhase()) {
            var winner = playerService.getPlayer(snapper);
            if (winner) {
                var value = Math.ceil(pile.getState().played.value / 2.0);
                if (pile.matchRunes()) {
                    winner.addScore(value);
                } else {
                    winner.addScore(-1*value);
                }
            }
            state.endSnap();
            nextTurn();
        }
    };

    var nextTurn = function() {
        if (state.isNextTurn()) {
            player.endTurn();
            player = playerService.nextTurn();
            player.setTurn(pile.getState());
            emitter.emit('updateTurn', player.playerID);

            self.drawHand(player);
        }
        if (deck.remaining() === 0) {
            self.finalRound();
            console.log('final round');
        }
        state.nextTurn();
    };

    this.drawHand = function(p) {
        var handSize = p.getHand().length;

        for (var i=handSize; i<balance.MAX_HAND; i++) {
            p.drawCard(deck);
        }
        emitter.emit('updateHand', p);
        emitter.emit('updateDeck', deck.remaining());
    };
};

module.exports = Game;
