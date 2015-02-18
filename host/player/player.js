var events = require('events');

function Player(id) {

    var self = this;

    var score = 0;
    var hand = [];
    var emitter = new events.EventEmitter();

    var ready = false;

    this.playerID = id;

    this.playCard = function(c) {
        var card = null;
        for (var i in hand) {
            if (hand[i].index === c) {
                card = hand.splice(i,1);
            }
        }
        return card[0];
    };

    this.active = false;

    this.addCard = function(card) {
        hand[hand.length] = card;
    };

    this.getHand = function() {
        return hand;
    };

    this.score = function(value) {
        score += value;
        emitter.emit('score', self);
    };

    this.getScore = function() {
        return score;
    };

    this.ready = function() {
        ready = true;
        self.active = true;
        emitter.emit('ready', self.playerID);
    };

    this.finished = function() {
        self.active = false;
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
