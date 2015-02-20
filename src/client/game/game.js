var EventEmitter = require('events').EventEmitter;

var Entity = require('./entities/entity');
var Player = require('./player');

var FSM = require('../util/fsm');

function Game(app) {
    EventEmitter.call(this);

    var fsm = FSM.create('starting', {
        'starting' : ['playing', 'waiting'],
        'waiting'  : ['playing', 'finished'],
        'playing'  : ['waiting', 'finished'],
        'finished' : ['starting']
    });

    this.player = new Player(app);

    var self = this;

    fsm.on('change', function(oldState, newState) {        
        console.log('Game state: ' + oldState + ' -> ' + newState);

        if (newState === 'finished') {
            app.transition('finished');
        }           
    });

    this.start = function() {
        // Update cards in hand
        app.transport.player('hand', JSON.parse, function(newHand) {
            newHand.forEach(self.player.hand.add);
        });

        // Update score display
        //app.transport.player('score', String, score.sprite.setText.bind(score.sprite));


        return fsm.change('starting');
    };

    this.playing = function(index) {
        self.player.index = index;
    };
}

Game.prototype = new EventEmitter();

module.exports = Game;
