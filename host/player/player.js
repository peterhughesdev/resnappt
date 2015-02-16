var events = require('events');

function Player(id) {

    var self = this;

    var score = 0;
    var hand = [];
    var emitter = new events.EventEmitter();

    this.playerID = id;

    this.playCard = function(c) {
        var card = hand[c];


    };

    this.ready = function() {
        emitter.emit('ready', self.playerID);
    };

    this.on = function(evt, callback) {
        emitter.on(evt, callback);
        return self;
    }
};

module.exports = Player;
