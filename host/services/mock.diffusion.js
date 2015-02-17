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
    emitter.emit('playerJoined', 'session1');
    emitter.emit('playerJoined', 'session2');

    emitter.emit('playerCommand', 'session1', {command:'READY'});
    emitter.emit('playerCommand', 'session2', {command:'READY'});

    emitter.emit('playerJoined', 'spectator1');

    for (var i=0; i<15; i++) {
        emitter.emit('playerCommand', 'session1', {command:'PLAY', card:1, pile:'EFFECT'});
        emitter.emit('playerCommand', 'session1', {command:'PLAY', card:0, pile:'SCORE'});

        emitter.emit('playerCommand', 'session2', {command:'PLAY', card:1, pile:'EFFECT'});
        emitter.emit('playerCommand', 'session2', {command:'PLAY', card:0, pile:'SCORE'});
    }

};
