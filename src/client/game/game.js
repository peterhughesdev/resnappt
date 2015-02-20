var EventEmitter = require('events').EventEmitter;

var Player = require('./player');

var FSM = require('../util/fsm');

function Game(app) {
    var emitter = new EventEmitter();

    var fsm = FSM.create('starting', {
        'starting' : ['playing'],
        'playing'  : ['snapping'],
        'snapping' : ['playing'],
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

    this.getState = function() {
        return fsm.state;
    };

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
                    if (fsm.change('snapping')) {
                        participants.forEach(function(p) {
                            if (p === player) {
                                p.setInactive();
                            } else {
                                p.setActive();
                            }
                        })  
                    }
                }

                if (timer === 0) {
                    participants.forEach(function(p) {
                        p.setInactive();
                    });

                    fsm.change('playing');
                }
            });
        }
    };

    this.addParticipant = function(session, turn, isPlayer) {
        var player = new Player(app, session, turn);

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
