var events = require('events');

function Player(id) {

    var self = this;

    var score = 0;
    var hand = [];
    var emitter = new events.EventEmitter()

    var ready = false;

    this.playerID = id;

    this.playCard = function(c) {
        var card = hand.splice(c,1);
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

    this.isReady = function() {
        return ready;
    };

    this.on = function(evt, callback) {
        emitter.on(evt, callback);
        return self;
    }
};

module.exports = Player;
