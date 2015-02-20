var EventEmitter = require('events').EventEmitter;


var Participant = require('./participant');
var Player = require('./player');

var FSM = require('../util/fsm');

function Game(app) {
    var emitter = new EventEmitter();

    var fsm = FSM.create('starting', {
        'starting' : ['dealing'],
        'playing'  : ['finished'],
        'finished' : ['starting']
    });
    
    var participantsBySession = {};
    var participants = [];
    
    var self = this;

    this.on = function(e, cb) {
        fsm.on('change', function(o, n) {
            if (n === e) {
                cb();
            }
        });      
    };

    this.start = function() {
        if (fsm.change('starting')) {

            app.transport.subscribe('?sessions/.*/hand', JSON.parse, function(newHand, topic) {
                var session = topic.split('/')[1];
                var player = participantsBySession[session]; 

                if (player) {
                    player.setHand(newHand);        
                }
            });

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
        }
    };

    this.addParticipant = function(session, turn, isPlayer) {
        var player = isPlayer ? new Player(app, turn) : new Participant(app, turn);

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
