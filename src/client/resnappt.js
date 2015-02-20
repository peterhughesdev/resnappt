var Transport = require('./data/transport');
var Renderer = require('./game/renderer');

var ServiceManager = require('./game/service-manager');
var SceneManager = require('./game/scene-manager');
var Game = require('./game/game');

var curry = require('./util/curry');
var FSM = require('./util/fsm');


/**
 * Parent application
 */
function App(opts) {
    var fsm = FSM.create('connecting', {
        'pre:error'      : ['error'],
        'error'          : [],
        'connecting'     : ['pre:connected', 'pre:error'],
        'pre:connected'  : ['connected', 'pre:error'],
        'connected'      : ['pre:joining', 'pre:error'],
        'pre:joining'    : ['joining', 'pre:error'],
        'joining'        : ['pre:playing', 'pre:spectating', 'pre:error'],
        'pre:playing'    : ['playing', 'pre:error'],
        'playing'        : ['finished', 'pre:error'],
        'pre:spectating' : ['spectating', 'pre:error'],
        'spectating'     : ['finished', 'pre:error'],
        'pre:finished'   : ['finished', 'pre:error'],
        'finished'       : ['pre:connected', 'pre:error']
    });

    if (opts.debug) {
        diffusion.log('debug');
    } else {
        diffusion.log('silent');
    }
       
    // Create transport, renderer & game
    this.transport = new Transport(opts);
    this.renderer = new Renderer(this);
    this.game = new Game(this);

    // Expose state machine
    this.getState = function() {
        return fsm.state;
    };

    // Allow services/scenes to transition
    this.transition = function(state) {
        return fsm.change('pre:' + state);
    };

    // Establish scenes
    var scenes = SceneManager.create(this, {
        'connecting' : require('./game/scenes/connecting'),
        'connected'  : require('./game/scenes/title'),
        'joining'    : require('./game/scenes/join'),
        'playing'    : require('./game/scenes/game'),
        'spectating' : require('./game/scenes/game'),
        'finished'   : require('./game/scenes/end'),
        'error'      : require('./game/scenes/error')
    });

    // Establish services
    this.services = ServiceManager.create(this, [
        require('./game/services/mousedown'),
        require('./game/services/mouseup'),
        require('./game/services/animate'),
        require('./game/services/move')
    ]);

    // Attach listeners for state and scene changes
    fsm.on('change', function(oldState, newState) {
        console.log('Transitioned state: ' + oldState + ' -> ' + newState);

        // Detect if we're in a 'pre' state and initiate scene transition if so
        if (newState.indexOf('pre:') > -1) {
            var target = newState.replace('pre:', '');

            scenes.transitionTo(target, function() {
                if (fsm.change(target)) {
                    console.log('State / Scene transition complete');
                } else {
                    fsm.change('error');
                }
            });
        }
    });

    // Attach listeners for transport events
    this.transport.on('error', curry(fsm.change, 'pre:error'));
    this.transport.on('close', curry(fsm.change, 'pre:error'));
    this.transport.on('connect', curry(fsm.change, 'pre:connected'));

    // Start it up
    this.renderer.init(this.services.onEvent, this.services.onTick);
    scenes.transitionTo('connecting', this.transport.connect);
}


module.exports = App;
