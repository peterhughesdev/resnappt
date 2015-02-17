var events = require('events');
var emitter = new events.EventEmitter();

exports.init = function() {

    var self = this;

    this.on = function(evt, cb) {
        emitter.on(evt, cb);
        return self;
    };
    return self;
};

exports.start = function() {
    var nPlayers = 4;

    for (var i=0; i<nPlayers; i++) {
        emitter.emit('playerJoined', 'session'+i);
    }
    for (var i=0; i<nPlayers; i++) {
        emitter.emit('playerCommand', 'session'+i, {command:'READY'});
    }

    for (var i=0; i<15; i++) {
        for (var j=0; j<nPlayers; j++) {
            emitter.emit('playerCommand', 'session'+j, {command:'PLAY', card:1, pile:'EFFECT'});
            emitter.emit('playerCommand', 'session'+j, {command:'PLAY', card:0, pile:'SCORE'});
        }
    }
};

exports.drawCard = function(player) {
    publish('sessions/'+player.playerID+'/hand', JSON.stringify(player.getHand()));
};

exports.updateDeck = function(remaining) {
    publish('deck', remaining);
};

exports.nextTurn = function(playerID) {
    publish('turn', playerID);
};

exports.topOfPile = function(card) {
    publish('pile/score', JSON.stringify(card.toData()));
};

exports.updateEffectsPile = function(effects) {
    var toPublish = [];
    for (var i in effects) {
        toPublish[toPublish.length] = effects[i].toData();
    }
    publish('pile/effects', JSON.stringify(toPublish));
};

exports.updateScore = function(player) {
    publish('sessions/'+player.playerID+'/score', player.getScore());
};

var publish = function(topic, data) {
    console.log('publishing '+topic+' with '+data);
};
