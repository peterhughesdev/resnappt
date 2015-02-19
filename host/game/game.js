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
    var turn = 0;
    var nTurns = 0;

    var deck = new Deck();
    var pile = new Pile();
    var state = new State();

    var finalRound = false;

    var snapping = false;
    var snapper = null;
    var snapInterval = null;
    var playerCanSnap = false;

    this.on = function(evt, callback) {
        emitter.on(evt, callback);
        return self;
    };

    this.isPlaying = function() {
        return playing;
    };

    this.start = function() {
        turn = 0;
        nTurns = 0;
        deck = new Deck();
        pile = new Pile();
        state = new State();
        finalRound = false;
        snapping = false;
        snapper = null;
        snapTimer = null;

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

            emitter.emit('updateTurn', playerService.getPlayerByIndex(turn).playerID);
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

        var turnPlayer = playerService.getPlayerByIndex(turn);
        var player = playerService.getPlayer(playerID);

        if (turnPlayer.playerID !== player.playerID) {
            console.log('Not player '+player.playerID+' turn');
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
                if (player.getHand().length > 1) {
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

        player.score(pile.getState().score);
        if (pile.getState().prevScore) {
            var previousIndex = turn - 1;
            if (previousIndex < 0) {
                previousIndex += playerService.getNPlayers();
            }
            playerService.getPlayerByIndex(previousIndex).score(pile.getState().score);
        }
        if (pile.getState().newCard && deck.remaining() > 0) {
            // immediately draw a new card upon Riposte.
            pile.play(deck.drawCard(), false);
            emitter.emit('updatePile', pile.getTop());
        }
        if (finalRound) {
            player.active = false;
            if(allPlayersFinished()){
                state.endGame();
                console.log('Game Finished');
                self.end();
            }
        }

        emitter.emit('updateEffects', pile.getEffects());

        state.startSnap();
        // start snap timer
        if (pile.getState().snap) {
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
        if (!state.isSnapPhase() ||
            (!pile.getState().newCard && playerService.getPlayerByIndex(turn).playerID === playerID)) {
            return;
        }
        snapping = false;
        snapper = playerID;
        clearInterval(snapInterval);
        snapScoring();
        emitter.emit('playerSnapped', playerID);
    };

    var snapScoring = function () {
        if (state.isSnapPhase()) {
            var winner = playerService.getPlayer(snapper);
            if (winner) {
                var value = Math.ceil(pile.getState().played.value / 2.0);
                if (pile.getState().top.modrune === pile.getState().played.modrune) {
                    winner.score(value);
                } else {
                    winner.score(-1*value);
                }
            }
            state.endSnap();
            nextTurn();
        }
    };

    var nextTurn = function() {
        if (state.isNextTurn()) {
            turn = (turn === playerService.getNPlayers() -1) ? turn = 0 : turn+1;
            emitter.emit('updateTurn', playerService.getPlayerByIndex(turn).playerID);
            nTurns++;

            self.drawHand(playerService.getPlayerByIndex(turn));
        }
        if (deck.remaining() === 0) {
            self.finalRound();
        }
        state.nextTurn();
    };

    this.drawHand = function(player) {
        var cards = Object.keys(player.getHand());
        var handSize = cards.length;

        for (var i=handSize; i<balance.MAX_HAND; i++) {
            var card = deck.drawCard();
            if (card) {
                player.addCard(card);
                emitter.emit('updateHand', player);
                emitter.emit('updateDeck', deck.remaining());
            }
        };
    };
};

module.exports = Game;
