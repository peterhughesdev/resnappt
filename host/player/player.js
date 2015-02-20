var events = require('events');

function Player(id, turn) {

    var self = this;

    var score = 0;
    var hand = [];
    var emitter = new events.EventEmitter();

    var ready = false;

    var canSnap = true;

    this.playerID = id;
    this.turn = turn;

    this.playCard = function(c) {
        var card = null;
        for (var i in hand) {
            if (hand[i].index === c) {
                card = hand.splice(i,1);
            }
        }
        return card[0];
    };

    this.finished = false;

    this.addCard = function(card) {
        hand[hand.length] = card;
    };

    this.drawCard = function(deck) {
        var card = deck.drawCard();
        if (card) {
            self.addCard(card);
        }
    };

    this.getHand = function() {
        return hand;
    };

    this.setTurn = function(state) {
        canSnap = false;
        if (state.riposte) {
            canSnap = true;
        }
    };

    this.canSnap = function() {
        return canSnap;
    };

    this.endTurn = function() {
        canSnap = true;
    };

    this.addScore = function(value) {
        score += value;
        emitter.emit('score', self);
    };

    this.getScore = function() {
        return score;
    };

    this.ready = function() {
        ready = true;
        emitter.emit('ready', self.playerID);
    };

    this.finished = function() {
        ready = false;
    };

    this.isReady = function() {
        return ready;
    };

    this.on = function(evt, callback) {
        emitter.on(evt, callback);
        return self;
    }
};

module.exports = Player;
