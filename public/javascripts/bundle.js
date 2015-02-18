(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/Peter/Dev/Projects/Resnappt/src/client/app.js":[function(require,module,exports){
var Game = require('./game');

diffusion.log('silent');


var game = new Game();

},{"./game":"/Users/Peter/Dev/Projects/Resnappt/src/client/game.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/data/transport.js":[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;

var options = {
    host : 'quickwittedAres.cloud.spudnub.com',
    ssl : false,
    reconnect : false,
    credentials : {
        principal : 'client',
        password : 'client'
    }
};

var log = console.log.bind(console);

function Transport() {
    EventEmitter.call(this);

    var sessionTopic = null;
    var commandTopic = null;

    var session = null;
    var self = this;

    this.dispatch = function(command, message) {
        session.topics.update(commandTopic, JSON.stringify({ 
            command : command, 
            message : message 
        }));
    };

    this.listen = function(event, message) {
    
    };

    this.player = function(topic, type, cb) {
        return this.subscribe(sessionTopic + '/' + topic, type, cb);
    };

    this.subscribe = function(topic, type, cb) {
        return session.subscribe(topic).on('error', log).transform(type).on('update', cb);
    };

    this.unsubscribe = function(topic) {
        return session.unsubscribe(topic);
    };

    this.init = function() {
        diffusion.connect(options).on('connect', function(sess) {
            session = sess;

            var sessionID = session.sessionID;
            self.sessionID = sessionID;

            sessionTopic = 'sessions/' + sessionID;
            commandTopic = sessionTopic + '/command';

            var initialD = JSON.stringify({
                command : 'READY',
                message : {
                    sessionID : sessionID
                }
            });

            session.topics.removeWithSession(sessionTopic).on('complete', function() {
                session.topics.add(sessionTopic).on('complete', function() {
                    session.topics.add(sessionTopic + '/command').on('complete', function() {
                        session.topics.add(sessionTopic + '/hand').on('complete', function() {
                            session.topics.add(sessionTopic + '/score', 0).on('complete', function() {
                                self.emit('active');
                            }).on('error', log);
                        }).on('error', log);
                    }).on('error', log);
                }).on('error', log);
            }).on('error', log); 
        });
    };
}

Transport.prototype = new EventEmitter();

module.exports = Transport;

},{"events":"/usr/local/lib/node_modules/watchify/node_modules/browserify/node_modules/events/events.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game.js":[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var Transport = require('./data/transport');
var Renderer = require('./game/renderer');
var Player = require('./game/player');
var Board = require('./game/gui/board');

var coords = require('./util/coords');

var log = console.log.bind(console);

function Game(app) {
    EventEmitter.call(this);

    var services = [];

    var transport = new Transport();
    this.transport = transport;

    var renderer = new Renderer(this, coords.width, coords.height);
    var board = new Board(this, renderer);
    
    this.renderer = renderer;

        var player;

    var self = this;

    transport.on('active', function() {
        player = new Player(self, transport);
    });

    this.render = function(entity) {
        renderer.add(entity);
    };

    this.tick = function(entity) {
        services.forEach(function(service) {
            if (service.handles(entity.type.id)) {
                service.process(entity);
            }
        });
    };

    transport.init();
    renderer.init();
}

Game.prototype = new EventEmitter();

module.exports = Game;

},{"./data/transport":"/Users/Peter/Dev/Projects/Resnappt/src/client/data/transport.js","./game/gui/board":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/gui/board.js","./game/player":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/player.js","./game/renderer":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/renderer.js","./util/coords":"/Users/Peter/Dev/Projects/Resnappt/src/client/util/coords.js","events":"/usr/local/lib/node_modules/watchify/node_modules/browserify/node_modules/events/events.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/card.js":[function(require,module,exports){
var Entity = require('./entity');

var Rune = Entity.type('Rune', {
    style : { 
        font : "bold 55px Arial",
        fill : "blue"
    }
});

var Card = Entity.type('Card', {
    width : 60,
    height : 102,
    texture : '/images/card.jpg'
});

function CardFactory(x, y, rune, score) {
    var r = Entity.createText(Rune, {
        x : -20,
        y : -40,
        text : rune
    });

    var card = Entity.create(Card, {
        x : x,
        y : y,
        data : {
           rune : rune,
           score : score
        }
    });

    card.sprite.addChild(r.sprite);

    return card;
};

module.exports = CardFactory;

},{"./entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/effect-pile.js":[function(require,module,exports){
var Entity = require('./entity');

var EffectPile = Entity.type('EffectPile', {
    width : 108,
    height : 150,
    texture : '/images/effect-placement.png'
});

function EffectPileFactory(x, y) {
    return Entity.create(EffectPile, {
        x : x,
        y : y
    });
}

module.exports = EffectPileFactory;

},{"./entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js":[function(require,module,exports){
var coords = require('../../util/coords');

var EntityID = 0;

var baseEntity = {
    width : 100,
    height : 100,
    interactive : true
};

function extend(base, target) {
    for (var prop in base) {
        if (target[prop] === undefined) {
            target[prop] = base[prop];
        }
    }

    return target;
} 

function Entity(type, props, sprite) {
    this.type = type;
    this.props = props;
    this.sprite = sprite;
}

// Expose known entity types
Entity.Types = {};

// Create a new entity type with specified attributes
Entity.type = function(name, base, attributes) {
    if (attributes === undefined) {
        attributes = base;
        base = baseEntity;
    }

    attributes = extend(base, attributes);
    attributes.id = EntityID++;
    
    Entity.Types[name] = attributes.id;

    return attributes;
};

function setSpriteProperties(type, properties, sprite) {
    // Normalise position according to screen space
    var norm = coords.translateToScreen(properties.x, properties.y);
    
    sprite.position.x = norm.x;
    sprite.position.y = norm.y;
   
    sprite.interactive = type.interactive;

    // Center anchor
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;

    //sprite.pivot.set(type.width / 2, type.height / 2);
}

// Create a new entity from a specified type and map of properties
Entity.create = function(type, properties) {
    var sprite = new PIXI.Sprite(PIXI.Texture.fromImage(type.texture, true));
    
    sprite.width = type.width;
    sprite.height = type.height;

    setSpriteProperties(type, properties, sprite);

    return new Entity(type, properties, sprite);
};

// Create a new Text Entity from a specified type and map of properties
Entity.createText = function(type, properties) {
    var sprite = new PIXI.Text(properties.text, type.style);
    
    setSpriteProperties(type, properties, sprite);

    return new Entity(type, properties, sprite);
};

module.exports = Entity;

},{"../../util/coords":"/Users/Peter/Dev/Projects/Resnappt/src/client/util/coords.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/score-pile.js":[function(require,module,exports){
var Entity = require('./entity');

var ScorePile = Entity.type('ScorePile', {
    width : 108,
    height : 150,
    texture : '/images/effect-placement.png'
});

function ScorePileFactory(x, y) {
    return Entity.create(ScorePile, {
        x : x,
        y : y
    });
}

module.exports = ScorePileFactory;

},{"./entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/score.js":[function(require,module,exports){
var Entity = require('./entity');

var Score = Entity.type('Score', {
    style : {
        font : "bold 50px Arial",
        fill : "red"
    } 
});

function ScoreFactory(x, y, text) {
    return Entity.createText(Score, {
        x : x,
        y : y,
        text : text
    });
};

module.exports = ScoreFactory;

},{"./entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/gui/board.js":[function(require,module,exports){
var EffectPile = require('../entities/effect-pile');
var ScorePile = require('../entities/score-pile');
var Score = require('../entities/score');

function Board(game, renderer) {
    var effectPiles = [
        EffectPile(100, 100),
        EffectPile(100, 350),
        EffectPile(100, 600)
    ];

    effectPiles.forEach(renderer.add);

    var scorePile = ScorePile(320, 250);
    renderer.add(scorePile);

}

module.exports = Board;

},{"../entities/effect-pile":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/effect-pile.js","../entities/score":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/score.js","../entities/score-pile":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/score-pile.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/player.js":[function(require,module,exports){
var Entity = require('./entities/entity');

var Card = require('./entities/card');
var Score = require('./entities/score');

var coords = require('../util/coords');

function Player(game, transport) {
    var score = Score(700, 200, '0');
    var hand = [];

    var canPlay = false;
    var currentCard = null;

    game.on('mouse:up', function(d) {
        if (canPlay) {
            var pos = d.getLocalPosition();
            var entity = this.renderer.getEntityForPos(pos.x, pos.y);
            
            if (entity) {
                if (entity.type.id === Entity.Types.Card) {
                    currentCard = entity; 
                }

                if (entity.type.id === Entity.Types.EffectPile && currentCard) {
                    
                }

                if (entity.type.id === Entity.Types.ScorePile && currentCard) {
                    
                }
            }
        }
    });

    this.play = function(card, pile) {
        transport.dispatch('PLAY', {
            card : card,
            pile : pile
        }); 
    };

    this.ready = function() {
        transport.dispatch('READY', {
            sessionID : transport.sessionID
        });
    };

    this.snap = function() {
        transport.dispatch('SNAP');
    };

    function handUpdate(newHand) {
        var i = Math.max(hand.length - 1, 0); 

        for (; i < newHand.length; ++i) {
            var card = Card(550 + (i * 65), 700, newHand[i].rune, newHand[i].score);
            
            hand.push(card);
            game.render(card);
        }
    };

    function scoreUpdate(newScore) {
        score.sprite.setText(newScore);
    };

    transport.player('hand', JSON.parse, handUpdate);
    transport.player('score', String, scoreUpdate);

    game.render(score);


    var deck = Score(700, 340, 'Dealing');

    transport.subscribe('deck', String, function(size) {
        deck.sprite.setText('Deck size: ' + size);
    });

    game.render(deck);

    transport.subscribe('turn', String, function(session) {
        console.log('Turn for', session);
        canPlay = (session === transport.sessionID);
    });

    setTimeout(function() {
        transport.dispatch('READY', {
                sessionID : transport.sessionID
        });
    }, 3000);
}

module.exports = Player;

},{"../util/coords":"/Users/Peter/Dev/Projects/Resnappt/src/client/util/coords.js","./entities/card":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/card.js","./entities/entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js","./entities/score":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/score.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/renderer.js":[function(require,module,exports){
var coords = require('../util/coords');

var Type = {
    ADD : 0,
    REMOVE : 1
};

var sl = Array.prototype.slice;

function curry () {
    var args = sl.call(arguments, 0);
    var fn = args.shift();

    return function() {
        fn.apply(fn, args.concat(sl.call(arguments, 0)));
    }
};

function Renderer(game, width, height) {
    var renderer = PIXI.autoDetectRenderer(width, height); 
    var stage = new PIXI.Stage('#000000', true);

    stage.scale = new PIXI.Point();

    var running = false;

    var entities = [];
    var pending = [];

    var mouseEvents = ['up', 'out', 'over', 'down', 'move'];
    var touchEvents = ['start', 'end'];
    var clickEvents = ['click', 'tap'];

    function attachListeners(entity) {
        mouseEvents.forEach(function(e) {
            entity.sprite['mouse' + e] = curry(game.emit.bind(game), 'mouse:' + e, entity);
        });

        touchEvents.forEach(function(e) {
            entity.sprite['touch' + e] = curry(game.emit.bind(game), 'touch:' + e, entity);
        });

        clickEvents.forEach(function(e) {
            entity.sprite[e] = curry(game.emit, e, entity);
        });
    }

    mouseEvents.forEach(function(e) {
        stage['mouse' + e] = curry(game.emit.bind(game), 'mouse:' + e);
    });

    function tick() {
        pending.forEach(function(action) {
            switch (action.type) {
                case Type.ADD :
                    //attachListeners(action.entity);
                    stage.addChild(action.entity.sprite);
                    entities.push(action.entity);
                    break;
                case Type.Remove :
                    stage.removeChild(action.entity.sprite);

                    var i = entities.indexOf(action.entity);
                    if (i > -1) {
                        entities.splice(i, 1);
                    }
                    
                    break;
            }
        });   

        pending = [];

        entities.forEach(function(entity) {
        });

        renderer.render(stage);

        if (running) {
            requestAnimationFrame(tick);
        }
    }

    this.add = function(entity) {
        pending.push({
            type : Type.ADD,
            entity : entity
        });
    };

    this.remove = function(entity) {
        pending.push({
            type : Type.REMOVE,
            entity : entity
        });
    };

    this.init = function() {
        document.body.appendChild(renderer.view);
        
        requestAnimationFrame(tick);
        running = true;
    };

    function intersects(sprite, x, y) {
        var sw = sprite.width / 2;
        var sh = sprite.height / 2;

        var sx = sprite.x;
        var sy = sprite.y;

        return ((x >= x - sw || x <= x + sw) && (y >= y - sh || y <= y + sh));
    }

    this.getEntitiesForPos = function(x, y) {
        var hit = [];

        for (var i = 0; i < entities.length; ++i) {
            if (intersects(entities[i].sprite, x, y)) {
                hit.push(entities[i]);
            }
        }

        return hit;
    };

    this.getEntityForPos = function(x, y) {
        var entities = this.getEntitiesForPos(x, y);
        return entities[0];
    }
}

module.exports = Renderer;

},{"../util/coords":"/Users/Peter/Dev/Projects/Resnappt/src/client/util/coords.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/util/coords.js":[function(require,module,exports){
// Reference screen size
var refW = 1100;
var refH = 1100;

// Viewport render dimensions (pixels)
var width = Math.max(window.innerWidth, document.body.clientWidth, refW);
var height = Math.max(window.innerHeight, document.body.clientHeight, refH);

// Midpoint from screen space
var midW = width / 2;
var midH = height / 2;

var ratio = Math.min(width / refW, height / refH);

function ratio(w, h) {
    return h / w;
}

function scaleSize(w, h) {
    var r = ratio(w, h);
    var p = w * 100 / refW;
    
    var nw = p / 100 * width;
    var nh = nw * r;

    return {
        width : nw,
        height : nh
    };
}

function translateToScreen(x, y) {
    return {
        x : (x/refW) * width,
        y : (y/refH) * height
    };
}

function translateToGame(x, y) {
    return {
        x : x - midW,
        y : y - midH
    };
}

module.exports = {
    ratio : ratio,
    width : width,
    height : height,
    scaleSize : scaleSize,
    translateToScreen : translateToScreen,
    translateToGame : translateToGame
};

},{}],"/usr/local/lib/node_modules/watchify/node_modules/browserify/node_modules/events/events.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},["/Users/Peter/Dev/Projects/Resnappt/src/client/app.js"]);
