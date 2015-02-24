var EventEmitter = require('events').EventEmitter;

var Player = require('./player');

var FSM = require('../util/fsm');

function Game(app) {
    var emitter = new EventEmitter();

    var fsm = FSM.create('starting', {
        'starting' : ['playing'],
        'playing'  : ['snapping', 'finished'],
        'snapping' : ['playing', 'finished'],
        'finished' : ['starting']
    });
    
    var participantsBySession = {};
    var participants = [];
    var player;

    var self = this;

    this.on = function(e, cb) {
        fsm.on('change', function(o, n) {
            if (n === e) {
                cb();
            }
        });      
    };

    fsm.on('change', function(o, n) {
        console.log('Game state: ' + o + ' -> ' + n);
    });

    this.getState = function() {
        return fsm.state;
    };

    var player;

    this.start = function() {
        if (fsm.change('starting')) {
            app.transport.subscribe('turn', String, function(curr) {
                if (fsm.change('playing')) {
                    if (player) {
                        player.setInactive();
                    }

                    player = participantsBySession[curr];

                    if (player) {
                        player.setActive();
                    }
                }
            });

            app.transport.subscribe('snap/timer', Number, function(timer) {
                if (timer === 5) {
                    fsm.change('snapping');
                }
                if (timer === 0) {
                    fsm.change('playing');
                }
            });
        }

        fsm.change('playing');
    };

    this.end = function() {
        if (fsm.change('finished')) {
            app.transport.unsubscribe('turn');
            app.transport.unsubscribe('snap/timer');

            participants.forEach(function(p) {
                p.remove();
            });

            participants = [];

            player = undefined;
        }
    };

    this.endRound = function() {
        if (fsm.change('snapping')) {
            player.setInactive(); 
        } else {
            fsm.change('playing');
        }
    };

    this.addParticipant = function(session, turn, isPlayer) {
        var player = new Player(app, session, turn, isPlayer);

        participantsBySession[session] = player;
        participants[turn] = player;

        if (isPlayer) {
            self.player = player;
        }
    };
    
    this.getParticipants = function() {
        return participants;
    };
}

module.exports = Game;
