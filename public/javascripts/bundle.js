(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/tmclaughlan/.node/lib/node_modules/watchify/node_modules/browserify/node_modules/events/events.js":[function(require,module,exports){
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

},{}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/app.js":[function(require,module,exports){
var options = {
    debug : false,

    host : 'quickwittedAres.cloud.spudnub.com',
    ssl : false,
    reconnect : false,
    credentials : {
        principal : 'client',
        password : 'client'
    }
};

var app = require('./resnappt')(options);


},{"./resnappt":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/resnappt.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/data/transport.js":[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;

var log = console.log.bind(console);

function Transport(options) {
    EventEmitter.call(this);

    var sessionTopic = null;
    var commandTopic = null;

    var session = null;
    var self = this;


    this.connect = function() {
        diffusion.connect(options).on('connect', function(sess) {
            session = sess;
            
            window.onclose = function() {
                session.close();
            };

            self.sessionID = session.sessionID;
            self.emit('connect');
        }).on('error', function(e) {
            self.emit('error', e);
        }).on('close', function(e) {
            self.emit('close', e);
        });
    };

    this.dispatch = function(command, message) {
        log(command, message);

        session.topics.update(commandTopic, JSON.stringify({ 
            command : command, 
            message : message 
        }));
    };

    this.player = function(topic, type, cb) {
        var t = topic ? sessionTopic + '/' + topic : sessionTopic;
        return this.subscribe(t, type, cb);
    };

    this.subscribe = function(topic, type, cb) {
        var sub = session.subscribe(topic).on('error', log).transform(type);
        
        if (cb) {
            sub.on('update', cb);
        }

        return sub;
    };

    this.unsubscribe = function(topic) {
        return session.unsubscribe(topic);
    };

    this.establishCommandTopic = function(callback) {
        sessionTopic = 'sessions/' + session.sessionID;
        commandTopic = sessionTopic + '/command';


        // Oh dear lord
        session.topics.removeWithSession(sessionTopic).on('complete', function() {
            session.topics.add(sessionTopic).on('complete', function() {
                session.topics.add(sessionTopic + '/command').on('complete', function() {
                    session.topics.add(sessionTopic + '/hand').on('complete', function() {
                        session.topics.add(sessionTopic + '/score', 0).on('complete', callback).on('error', log);
                    }).on('error', log);
                }).on('error', log);
            }).on('error', log);
        }).on('error', log); 
    };
}

Transport.prototype = new EventEmitter();

module.exports = Transport;

},{"events":"/Users/tmclaughlan/.node/lib/node_modules/watchify/node_modules/browserify/node_modules/events/events.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/background.js":[function(require,module,exports){
var Entity = require('./entity');

var Background = Entity.type('Background', {
    width : 2048,
    height : 1536,
    texture : '/images/background.png'
});

function BackgroundFactory() {
    var bg = Entity.create(Background, {
        x : 1024,
        y : 768
    });
    // var normalsImage = PIXI.Texture.fromImage('/images/background-normals.png');
    // var normals = new PIXI.NormalMapFilter(normalsImage);
    // bg.normals = normals;
    // bg.sprite.filters = [normals];
    return bg;
};

module.exports = BackgroundFactory;

},{"./entity":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/entity.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/board.js":[function(require,module,exports){
var Entity = require('./entity');

var Board = Entity.type('Board', {
    width : 660,
    height : 660,
    texture : '/images/rune.png'
});

function BoardFactory(x, y, id) {
    return Entity.create(Board, {
        x : x,
        y : y,
        name : id
    });
};

module.exports = BoardFactory;

},{"./entity":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/entity.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/button.js":[function(require,module,exports){
var Entity = require('./entity');

var Button = Entity.type('Button', {
    width : 150,
    height : 150,
    texture : '/images/join-btn.png'
});

function ButtonFactory(x, y) {
    return Entity.create(Button, {
        x : x,
        y : y
    });
}

module.exports = ButtonFactory;

},{"./entity":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/entity.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/card.js":[function(require,module,exports){
var Entity = require('./entity');

var Rune = Entity.type('Rune', {
    style : { 
        font : "bold 100px LibianRunic",
        fill : "blue"
    }
});

var Name = Entity.type('Name', {
    style : {
        font : "bold 50px Arial",
        fill : "blue"
    }
});

var Desc = Entity.type('Desc', {
    width : 140,
    style : {
        font : "30px Arial",
        fill : "black"
    }
});

var Card = Entity.type('Card', {
    width : 133,
    height : 200,
    texture : '/images/card.jpg'
});


function CardFactory(x, y, data) {
    var rune = "";
    switch (data.rune) {
    case 'a':
        rune = "\u0080";
        break;
    case 'b':
        rune = "\u0081";
        break;
    case 'c':
        rune = "\u0082";
        break;
    case 'd':
        rune = "\u0083";
        break;
    };

    var rune = Entity.createText(Rune, {
        x : 80,
        y : 90,
        text : data.rune
    });

    var duration = Entity.createText(Rune, {
        x : 110,
        y : 240,
        text : data.effect.duration
    });

    var score = Entity.createText(Rune, {
        x : 110,
        y : -240,
        text : data.value
    });

    var name = Entity.createText(Name, {
        x : -40,
        y : -240,
        text : data.effect.name 
    });

    var desc = Entity.createText(Desc, {
        x : -20,
        y : 180,
        text : "" 
    });

    var texture = '/images/cards/' + data.name.toLowerCase() + '.png';

    var card = Entity.create(Card, {
        x : x,
        y : y,
        index : data.index,
        rune : data.rune,
        score : data.score,
        texture : texture
    });

    card.sprite.addChild(duration.sprite);
    card.sprite.addChild(name.sprite);
    card.sprite.addChild(rune.sprite);
    card.sprite.addChild(score.sprite);

    return card;
};

module.exports = CardFactory;

},{"./entity":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/entity.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/effect-pile.js":[function(require,module,exports){
var Entity = require('./entity');

var EffectPile = Entity.type('EffectPile', {
    width : 133,
    height : 200,
    texture : '/images/effect-placement.png'
});

function EffectPileFactory(x, y) {
    return Entity.create(EffectPile, {
        x : x,
        y : y
    });
}

module.exports = EffectPileFactory;

},{"./entity":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/entity.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/entity.js":[function(require,module,exports){
var coords = require('../../util/coords');

var EntityID = 0;

var baseEntity = {
    width : 100,
    height : 100,
    interactive : false 
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
    //var norm = coords.translateToScreen(properties.x, properties.y);
    
    sprite.position.x = properties.x; //norm.x;
    sprite.position.y = properties.y; //norm.y;
   
    sprite.interactive = type.interactive;

    // Center anchor
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;

    //sprite.pivot.set(type.width / 2, type.height / 2);
}

// Create a new entity from a specified type and map of properties
Entity.create = function(type, properties) {
    type = extend(type, properties);

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

<<<<<<< HEAD
},{"../../util/coords":"/Users/Peter/Dev/Projects/Resnappt/src/client/util/coords.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/player-gui.js":[function(require,module,exports){
var Entity = require('./entity');

var GUI = Entity.type('PlayerGUI', {
    width : 400,
    height : 200,
    texture : '/images/effect-placement.png'
});

function GUIFactory(x, y, name, score, icon) {
    var gui = Entity.create(GUI, {
        x : x,
        y : y
    });

    gui.sprite.addChild(name.sprite);
    gui.sprite.addChild(score.sprite);
    gui.sprite.addChild(icon.sprite);

    return gui;
}  

module.exports = GUIFactory;

},{"./entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/score-pile.js":[function(require,module,exports){
=======
},{"../../util/coords":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/util/coords.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/score-pile.js":[function(require,module,exports){
>>>>>>> cf7ad1c9d75e45862632004f3d108706be587135
var Entity = require('./entity');

var ScorePile = Entity.type('ScorePile', {
    width : 133,
    height : 200,
    texture : '/images/effect-placement.png'
});

function ScorePileFactory(x, y) {
    return Entity.create(ScorePile, {
        x : x,
        y : y
    });
}

module.exports = ScorePileFactory;

},{"./entity":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/entity.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/text.js":[function(require,module,exports){
var Entity = require('./entity');

var Text = Entity.type('Text', {
    style : {
        font : "bold 64px LibianRunic",
        fill : "white"
    } 
});

function TextFactory(x, y, text) {
    return Entity.createText(Text, {
        x : x,
        y : y,
        text : text
    });
};

module.exports = TextFactory;

},{"./entity":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/entity.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/title.js":[function(require,module,exports){
var Entity = require('./entity');

var Title = Entity.type('Title', {
    width : 656,
    height : 72,
    texture : '/images/title.png'
});

function TitleFactory(x, y) {
    return Entity.create(Title, {
        x : x,
        y : y
    });
};

module.exports = TitleFactory;

},{"./entity":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/entity.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/game.js":[function(require,module,exports){
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

<<<<<<< HEAD
},{"../util/fsm":"/Users/Peter/Dev/Projects/Resnappt/src/client/util/fsm.js","./player":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/player.js","events":"/usr/local/lib/node_modules/watchify/node_modules/browserify/node_modules/events/events.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/hand.js":[function(require,module,exports){
=======
},{"../util/fsm":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/util/fsm.js","./participant":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/participant.js","./player":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/player.js","events":"/Users/tmclaughlan/.node/lib/node_modules/watchify/node_modules/browserify/node_modules/events/events.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/hand.js":[function(require,module,exports){
>>>>>>> cf7ad1c9d75e45862632004f3d108706be587135
var Card = require('./entities/card');

function Hand(game, x, y) {
    var cards = [];
    var cardByIndex = {};

    function create(data) {
        var card = Card(x, y, data);
        
        game.renderer.add(card);
        cards.push(card); 
    }

    function reposition(card, i) {
        card.sprite.position.x = x + (i * 105);
        card.sprite.position.y = y;
    }

    function reassign(card, i) {
        cardByIndex[card.props.index] = i;
    }

    this.add = function(data) {
        console.log(data);
        if (cardByIndex[data.index] === undefined) {
            create(data);
            
            cards.forEach(reposition);
            cards.forEach(reassign);
        }
    };

    this.remove = function(index) {
        if (cardByIndex[index] !== undefined) {
            cards.splice(cardByIndex[index], 1).forEach(game.remove);
            delete cardByIndex[index];
            
            cards.forEach(reposition);
            cards.forEach(reassign);
        }
    };

    this.get = function(index) {
        if (index) {
            return cards[cardByIndex[index]];
        } else {
            return cards;
        }
    };

    this.has = function(index) {
        return cardByIndex[index] !== undefined;
    };

    this.size = function() {
        return cards.length;
    };
}

module.exports = Hand;

<<<<<<< HEAD
},{"./entities/card":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/card.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/player.js":[function(require,module,exports){
var PlayerGUI = require('./entities/player-gui');
var Score = require('./entities/score');

=======
},{"./entities/card":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/card.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/participant.js":[function(require,module,exports){

},{}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/player.js":[function(require,module,exports){
>>>>>>> cf7ad1c9d75e45862632004f3d108706be587135
var Hand = require('./hand');

// Player GUIs
var playerPosition = [
    { x : 200, y : 200 },
    { x : 1800, y : 200 },
    { x : 200, y : 1200 },
    { x : 1800, y : 1200 }
];

function Player(app, session, turn) { 
    var pos = playerPosition[turn];

    var score = Score(0, 80, '0');
    var name = Score(0, 80, session);
    var icon = Score(200, 0, 'Playing');

    var gui = PlayerGUI(pos.x, pos.y, name, score, icon);

    var hand = new Hand(app, pos.x + 20, pos.y + 20);

    var topic = 'sessions/' + session + '/';
    var active = false;

    this.hand = hand;

    app.transport.subscribe(topic + 'score', String, function(t) {
        score.sprite.setText(t);    
    });

    app.transport.subscribe(topic + 'hand', JSON.parse, function(newHand) {
        newHand.forEach(hand.add);
    });

    this.play = function(card, pile) {
        app.transport.dispatch('PLAY', {
            card : card,
            pile : pile
        }); 
    };

    this.snap = function() {
        app.transport.dispatch('SNAP', {});
    };

    this.remove = function() {
     
    };

    this.setActive = function() {
        icon.sprite.alpha = 1;
        active = true;
    };

    this.setInactive = function() {
        icon.sprite.alpha = 0;
        active = false;
    };

    this.isActive = function() {
        return active;
    };

    this.getGUI = function() {
        return gui;
    };
}

module.exports = Player;

<<<<<<< HEAD
},{"./entities/player-gui":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/player-gui.js","./entities/score":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/score.js","./hand":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/hand.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/renderer.js":[function(require,module,exports){
=======
},{"./hand":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/hand.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/renderer.js":[function(require,module,exports){
>>>>>>> cf7ad1c9d75e45862632004f3d108706be587135
var coords = require('../util/coords');
var curry = require('../util/curry');

var Type = {
    ADD : 0,
    REMOVE : 1
};

function Renderer(app) {
    var renderer = PIXI.autoDetectRenderer(coords.width, coords.height); 
    var stage = new PIXI.Stage('#000000', true);

    var container = new PIXI.DisplayObjectContainer();
    stage.addChild(container);

    window.addEventListener('resize', resize);
    window.addEventListener('deviceOrientation', resize);

    function resize() {
        var width = Math.max(window.innerWidth, document.body.clientWidth);
        var height = Math.max(window.innerHeight, document.body.clientHeight);

        renderer.resize(width, height);

        var scale = coords.scaleSize(width, height);
        
        container.scale.x = scale.x;
        container.scale.y = scale.y;

        container.pivot.x = 0.5;
        container.pivot.y = 0.5;
    }


    var running = false;

    var entities = [];
    var pending = [];

    var mouseEvents = ['up', 'out', 'over', 'down', 'move'];
    var touchEvents = ['start', 'end'];
    var clickEvents = ['click', 'tap'];

    this.onTick = function() { }
    
    var self = this;
    var pT = Date.now();

    function tick() {
        pending.forEach(function(action) {
            switch (action.type) {
                case Type.ADD :
                    container.addChild(action.entity.sprite);
                    entities.push(action.entity);
                    break;
                case Type.REMOVE :
                    container.removeChild(action.entity.sprite);

                    var i = entities.indexOf(action.entity);
                    if (i > -1) {
                        entities.splice(i, 1);
                    }
                    
                    break;
            }
        });   

        pending = [];

        var t = Date.now();
        
        self.onTick(t - pT);

        pT = t;

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

    this.init = function(onEvent, onTick) {
        document.body.appendChild(renderer.view);
        resize();

        mouseEvents.forEach(function(e) {
            stage['mouse' + e] = curry(onEvent, 'mouse:' + e);
        });

        self.onTick = onTick;

        requestAnimationFrame(tick);
        running = true;
    };

    // Really simple bounding box
    function intersects(sprite, x, y) {
        var sw = sprite.width / 2;
        var sh = sprite.height / 2;

        var sx = sprite.x;
        var sy = sprite.y;

        return ((x >= sx - sw && x <= sx + sw) && (y >= sy - sh && y <= sy + sh));
    }

    this.getEntities = function() {
        return entities;
    };

    this.getEntitiesForPos = function(data) {
        var pos = data.getLocalPosition(container);
        var hit = [];

        for (var i = 0; i < entities.length; ++i) {
            if (intersects(entities[i].sprite, pos.x, pos.y)) {
                hit.push(entities[i]);
            }
        }

        return hit;
    };

    this.getEntityForPos = function(data) {
        var entities = this.getEntitiesForPos(data);
        return entities[0];
    };

    this.getLocalPosition = function(data) {
        return data.getLocalPosition(container);
    };
}

module.exports = Renderer;

},{"../util/coords":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/util/coords.js","../util/curry":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/util/curry.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/scene-manager.js":[function(require,module,exports){
var FSM = require('../util/fsm');

function Container(app) {
    var added = [];
    
    this.add = function(entity) {
        app.renderer.add(entity);
        added.push(entity);
    };

    this.remove = function(entity) {
        app.renderer.remove(entity);
        
        var i = added.indexOf(entity);
        if (i > -1) {
            added.splice(i, 1);
        }
    };

    this.clear = function() {
        added.forEach(app.renderer.remove);
        added = [];
    };
}

function Scene(container, scene) {
    var self = this;

    this.enter = function(done) {
        scene.enter(done);
    };

    this.leave = function(done) {
        scene.leave(function() {
            container.clear();
            done();
        });
    };
}

function SceneManager(app) {
    var fsm = FSM.create('transitioned', {
        'transitioned' : ['transitioning'],
        'transitioning' : ['transitioned']
    });

    var scenes = {};
    var current;

    app.renderer.onTick = function(dt) {
        if (current) {
            current.update(dt);
        }
    }

    function create(name, constructor) {
        if (scenes[name] !== undefined) {
            return;
        }

        var container = new Container(app);
        scenes[name] = new Scene(container, new constructor(app, container));
    };

    this.create = function(pairs) {
        for (var k in pairs) {
            create(k, pairs[k]);
        }
    }

    this.transitionTo = function(name, done) {
        if (scenes[name] && fsm.change('transitioning')) {
            function enter() {
                current = scenes[name];
                current.enter(function() {
                    if (fsm.change('transitioned')) {
                        console.log('Transitioned to scene: ' + name);
                    } else {
                        console.log('Unable to transition to scene: ' + name);
                    }

                    done();
                });
            }

            if (current) {
                current.leave(enter);
            } else {
                enter();
            }
        } else {
            done();
        }
    };
}

SceneManager.create = function(app, scenes) {
    var manager = new SceneManager(app);
    manager.create(scenes);

    return manager;
}

module.exports = SceneManager;

},{"../util/fsm":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/util/fsm.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/scenes/connecting.js":[function(require,module,exports){
var Text = require('../entities/text');

function ConnectingScene(app, container) {
    var connectingText = Text(1024, 700, 'Connecting...');

    this.enter = function(done) {
        container.add(connectingText);
        done();
    };

    this.leave = function(done) {
        done();
    };
}

module.exports = ConnectingScene;

},{"../entities/text":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/text.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/scenes/end.js":[function(require,module,exports){
function EndScene(app, container) {
    this.enter = function(done) {
        done();
    };

    this.leave = function(done) {
        done();
    };
}

module.exports = EndScene;

},{}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/scenes/error.js":[function(require,module,exports){
var Text = require('../entities/text');

function ErrorScene(app, container) {
    var message = Text(1024, 700, 'Error :(');

    this.enter = function(done) {
        container.add(message);
        done();
    };

    this.leave = function(done) {
        done();
    };
}

module.exports = ErrorScene;

},{"../entities/text":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/text.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/scenes/game.js":[function(require,module,exports){
var EffectPile = require('../entities/effect-pile');
var ScorePile = require('../entities/score-pile');
var Text = require('../entities/text');
var Background = require('../entities/background');
var Board = require('../entities/board');
var Card = require('../entities/card');

var effectCardPos = [
    { x : 768, y : 768 },
    { x : 1024, y : 1024 },
    { x : 1280, y : 768 }
];

var scoreCardPos = { x : 1024, y : 768 };

function GameScene(app, container) {
    // Effect card slots
    var effectPiles = [
        EffectPile(effectCardPos[0].x, effectCardPos[0].y),
        EffectPile(effectCardPos[1].x, effectCardPos[1].y),
        EffectPile(effectCardPos[2].x, effectCardPos[2].y)
    ];

    var effectCards = [];

    // Score cards
    var scorePile = ScorePile(scoreCardPos.x, scoreCardPos.y);
    var scoreCard;

    var deck = Text(1024, 240, 'Dealing');
    var turn = Text(1024, 300, 'Waiting to start');

    var bg = Background();
    var board = Board(1024, 768, 'base');
    
    // Subscribe to gameplay topics
    var turnSub;
    var deckSub;
    var scorePileSub;
    var effectPileSub;

    app.game.on('playing', function() {
        game.getParticipants().forEach(function(participant, i) {
            container.add(participant.getGUI());
        });
    });

    app.game.on('finished', function() {
        app.transition('finished');
    });

    this.enter = function(done) {
        container.add(bg);
        container.add(board);

        // Setup board
        effectPiles.forEach(container.add);
        container.add(scorePile);

        container.add(deck);
        container.add(turn);

        turnSub = app.transport.subscribe('turn', String).on('update', updateTurn);
        deckSub = app.transport.subscribe('deck', String).on('update', updateDeck);

        scorePileSub = app.transport.subscribe('pile/score', JSON.parse).on('update', updateScorePile);
        effectPileSub = app.transport.subscribe('pile/effects', JSON.parse).on('update', updateEffectPile);
        
        app.game.start();

        done();
    };

    this.leave = function(done) {
        turnSub.off('update', updateTurn);
        deckSub.off('update', updateDeck);

        scorePileSub.off('update', updateScorePile);
        effectPileSub.off('update', updateEffectPile);

        done();
    };

    function updateTurn(session) {
        if (session === transport.sessionID) {
            turn.sprite.setText('Your turn'); 
        } else {
            turn.sprite.setText('Other player\'s turn');
        }
    }

    function updateDeck(size) {
        deck.sprite.setText('Deck size: ' + size); 
    }

    function updateScorePile(newScoreCard) {
        if (scoreCard) {
            container.remove(scoreCard);
        }

        scoreCard = Card(scoreCardPos.x, scoreCardPos.y, newScoreCard);
        container.add(scoreCard);
    }

    function updateEffectPile(newEffectCards) {
        effectCards.forEach(container.remove);

        newEffectCards.forEach(function(data, i) {
            var pos = effectCardPos[i];
            var effectCard = Card(pos.x, pos.y, data);
            
            container.add(effectCard);
            effectCards.push(effectCard);
        });
    }
}

module.exports = GameScene;

},{"../entities/background":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/background.js","../entities/board":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/board.js","../entities/card":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/card.js","../entities/effect-pile":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/effect-pile.js","../entities/score-pile":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/score-pile.js","../entities/text":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/text.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/scenes/join.js":[function(require,module,exports){
var Text = require('../entities/text');
var Background = require('../entities/background');
var Board = require('../entities/board');

function JoinScene(app, container) {
    var message = Text(1024, 700, 'Joining game');

    var playerSub;
    var playerReady;
    var playerLeft;

    var bg = Background();
    var board = Board(1024, 768, 'base');

    var handler;

    this.enter = function(done) {
        container.add(bg);
        container.add(board);
        container.add(message);

        playerReady = function(res, topic) {
            var session = topic.split('/')[1];

            if (session === app.transport.sessionID) {
                switch (res.type) {
                    case 'PLAYER' :
                        app.game.addParticipant(session, res.turn, true);
                        app.transition('playing');
                        break;
                    default :
                        app.transition('spectating');
                        break;
                }
            } else if (res.type === 'PLAYER') {
                app.game.addParticipant(session, res.turn); 
            }
        }

        playerLeft = function(reason, topic) {
            var session = topic.split('/')[1];
            app.game.remove()
        }

        playerSub = app.transport.subscribe('?sessions/.*', JSON.parse, playerReady);
        playerSub.on('unsubscribed', playerLeft);
        done();

        // Put this here so we're guaranteed that the scene transition
        // has completed by the time we receive the status response
        app.transport.dispatch('READY', {
                sessionID : app.transport.sessionID
        });
    };

    this.leave = function(done) {
        playerSub.off('update', playerReady);
        playerSub.off('unsubscribed', playerLeft);
        done();
    };
}

module.exports = JoinScene;

},{"../entities/background":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/background.js","../entities/board":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/board.js","../entities/text":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/text.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/scenes/title.js":[function(require,module,exports){
var Title = require('../entities/title');
var JoinBtn = require('../entities/button.js');
var Board = require('../entities/board');
var Background = require('../entities/background');
var Text = require('../entities/text');

function TitleScene(app, container) {
    var title = Title(1024, 768, '{resnappt}');
    var ready = JoinBtn(1024, 1015);
    var joinText = Text(0, 0, "\u0080");
    var bg = Background();
    var boardDark = Board(1024, 768, 'dark');
    var boardLight = Board(1024, 768, 'light');
    var board = Board(1024, 768, 'base');

    this.enter = function(done) {
        container.add(bg);
        container.add(board);
        container.add(boardDark);
        container.add(boardLight);
        container.add(title);

        var blur = new PIXI.BlurFilter();
        blur.blurX = 6;
        blur.blurY = 6;
        boardLight.sprite.filters = [blur];
        boardLight.sprite.alpha = 0.3;
        boardDark.sprite.alpha = 0.7;
        board.sprite.alpha = 0.7;

        boardLight.sprite.blendMode = PIXI.blendModes.SCREEN;
        boardDark.sprite.blendMode = PIXI.blendModes.MULTIPLY;

        app.transport.establishCommandTopic(function() {
            ready.sprite.addChild(joinText.sprite);
            container.add(ready);
            done();
<<<<<<< HEAD
        }); 
    }
    
    this.leave = function(done) {
        var id = setInterval(function() {
            title.sprite.alpha -= 0.1;
            ready.sprite.alpha -= 0.1;

            if (title.sprite.alpha <= 0) {
                clearInterval(id);
                done();
            }
        }, 1000 / 60);
    }
}

module.exports = TitleScene;

},{"../entities/button.js":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/button.js","../entities/score":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/score.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/service-manager.js":[function(require,module,exports){
function ServiceManager(app) {
    var servicesForEvents = {};
    var servicesForTick = [];

    var ctx = {};
    
    this.add = function(service) {
        if (service.events) {
            service.events.forEach(function(e) {
                if (servicesForEvents[e] === undefined) {
                    servicesForEvents[e] = [];
                }

                servicesForEvents[e].push(service.handler);
            });
        } else {
            servicesForTick.push(service.handler);
        }
    };

    this.onTick = function(dt) {
        servicesForTick.forEach(function(service) {
            service(app, ctx, dt);
        }); 
    };

    this.onEvent = function(e, data) {
        if (servicesForEvents[e]) {
            servicesForEvents[e].forEach(function(service) {
                service(e, app, ctx, data);
            });
        }
    };
}

ServiceManager.create = function(app, services) {
    var manager = new ServiceManager(app);
    services.forEach(manager.add);

    return manager;
};

module.exports = ServiceManager;

},{}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/services/animate.js":[function(require,module,exports){
var Entity = require('../entities/entity');

var t = 0;

function animate(app, ctx, dt) {
    var entities = app.renderer.getEntities();

    if (app.getState() === 'connected') {
        var title = entities.filter(function(e) {
            return e.type.id === Entity.Types.Score;
        })[0];

        if (title) {
            title.sprite.y = title.sprite.y + (Math.sin(t) * 0.2);
            t += 0.02;
        }
    }
}

module.exports = {
    handler : animate
};

},{"../entities/entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/services/mousedown.js":[function(require,module,exports){
var Entity = require('../entities/entity');

function mousedown(e, app, ctx, data) {
    if (app.getState() === 'playing') {
        var entities = app.renderer.getEntitiesForPos(data);

        if (entities.length && !ctx.currentCard) {
            var entity = entities[entities.length - 1];
            var hand = app.game.player.hand;

            // Selecting a hand card
            if (entity.type.id === Entity.Types.Card && hand.has(entity.props.index)) {
                ctx.currentCard = hand.get(entity.props.index);
            }
        }
    }
}

module.exports = {
    events : ['mouse:down'],
    handler : mousedown
};

},{"../entities/entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/services/mouseup.js":[function(require,module,exports){
var Entity = require('../entities/entity');

function mouseup(e, app, ctx, data) {
    var entities = app.renderer.getEntitiesForPos(data);

    if (entities.length) {
        var entity = entities[entities.length - 1];
        var bottom = entities[0];

        if (app.getState() === 'playing') {
            var currentCard = ctx.currentCard;
            var player = app.game.player;

            // Adding a card to the score pile
            if (bottom.type.id === Entity.Types.ScorePile && currentCard !== undefined) {
                player.play(currentCard.props.index, 'SCORE')

                currentCard.sprite.x = bottom.sprite.x;
                currentCard.sprite.y = bottom.sprite.y;
                currentCard.sprite.tint = 0xFFFFFF;

                player.hand.remove(currentCard.props.index);
            }

            // Adding a card to the effect pile
            if (bottom.type.id === Entity.Types.EffectPile && currentCard !== undefined && player.hand.size() > 1) {
                player.play(currentCard.props.index, 'EFFECT');

                currentCard.sprite.x = bottom.sprite.x;
                currentCard.sprite.y = bottom.sprite.y;
                currentCard.sprite.tint = 0xFFFFFF;

                player.hand.remove(currentCard.props.index);
            }

            // Snap the score pile 
            if (bottom.type.id === Entity.Types.ScorePile) {
                player.snap();
            }
        }

        if (app.getState() === 'connected') {
            // Join the game
            if (bottom.type.id  === Entity.Types.Button) {
                app.transition('joining');
            }    
       }

       ctx.currentCard = undefined;
    }
}

module.exports = {
    events : ['mouse:up'],
    handler : mouseup
};

},{"../entities/entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/services/move.js":[function(require,module,exports){
var Entity = require('../entities/entity');

function mousemove(e, app, ctx, data) {
    var pos = app.renderer.getLocalPosition(data);

    if (app.getState() === 'playing') {
        var currentCard = ctx.currentCard;
        var highlighted = ctx.highlighted;

        if (currentCard) {
            currentCard.sprite.position.x = pos.x;
            currentCard.sprite.position.y = pos.y;

            // TODO: Update card topic
        } else {
            var entities = app.renderer.getEntitiesForPos(data);

            if (entities.length && app.game.getState() === 'playing' && app.game.player.isActive()) {
                var entity = entities[entities.length - 1];

                if (entity.type.id === Entity.Types.Card && app.game.player.hand.has(entity.props.index)) {
                    if (highlighted) {
                        highlighted.sprite.tint = 0xFFFFFF;
                    }

                    highlighted = entities[entities.length - 1]; 
                }

                if (highlighted) {
                    highlighted.sprite.tint = 0xFFFF00;
                }
            } else {
                if (highlighted) {
                    highlighted.sprite.tint = 0xFFFFFF; 
                    highlighted = undefined;
                }
            }

            ctx.highlighted = highlighted;
        }
    }
}

module.exports = {
    events : ['mouse:move'],
    handler : mousemove
};

},{"../entities/entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/resnappt.js":[function(require,module,exports){
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
=======
        });
>>>>>>> cf7ad1c9d75e45862632004f3d108706be587135
    }

    this.leave = function(done) {
        var brighten = true;
        var id = setInterval(function() {
            title.sprite.alpha -= 0.01;
            ready.sprite.alpha -= 0.01;

            if (board.sprite.alpha < 1) {
                board.sprite.alpha += 0.001;
            }
            if (boardDark.sprite.alpha > 0) {
                boardDark.sprite.alpha -= 0.025;
            }

            if (boardLight.sprite.alpha > 0.95) {
                brighten = false;
            }

            if (boardLight.sprite.alpha <= 1 && brighten) {
                boardLight.sprite.alpha += 0.025;
            } else if (boardLight.sprite.alpha > 0) {
                boardLight.sprite.alpha -= 0.025;
            }

            if (title.sprite.alpha <= 0) {
                clearInterval(id);
                done();
            }
        }, 1000 / 60);
    }
}

module.exports = TitleScene;

},{"../entities/background":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/background.js","../entities/board":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/board.js","../entities/button.js":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/button.js","../entities/text":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/text.js","../entities/title":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/title.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/service-manager.js":[function(require,module,exports){
function ServiceManager(app) {
    var servicesForEvents = {};
    var servicesForTick = [];

    var ctx = {};
    
    this.add = function(service) {
        if (service.events) {
            service.events.forEach(function(e) {
                if (servicesForEvents[e] === undefined) {
                    servicesForEvents[e] = [];
                }

                servicesForEvents[e].push(service.handler);
            });
        } else {
            servicesForTick.push(service.handler);
        }
    };

    this.onTick = function(dt) {
        servicesForTick.forEach(function(service) {
            service(app, ctx, dt);
        }); 
    };

    this.onEvent = function(e, data) {
        if (servicesForEvents[e]) {
            servicesForEvents[e].forEach(function(service) {
                service(e, app, ctx, data);
            });
        }
    };
}

ServiceManager.create = function(app, services) {
    var manager = new ServiceManager(app);
    services.forEach(manager.add);

    return manager;
};

module.exports = ServiceManager;

},{}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/services/animate.js":[function(require,module,exports){
var Entity = require('../entities/entity');

var t = 0;

function animate(app, ctx, dt) {
    var entities = app.renderer.getEntities();

    if (app.getState() === 'connected') {
        var title = entities.filter(function(e) {
            return e.type.id === Entity.Types.Title;
        })[0];

        if (title) {
            title.sprite.width = title.sprite.width + (Math.sin(t) * 0.1024);
            title.sprite.height = title.sprite.height + (Math.sin(t) * 0.0768);
        }

        var boards = entities.filter(function(e) {
            return e.type.id === Entity.Types.Board;
        });

        for (var b in boards) {
            var board = boards[b];
            switch (board.props.name) {
            case 'dark':
                board.sprite.alpha = 0.7 + (Math.sin(t*2) * 0.3);
                break;
            case 'light':
                board.sprite.alpha = 0.1 + (Math.cos(t*2) * 0.2);
                break;
            case 'base':
                board.sprite.alpha = 0.7 + (Math.sin(t*2) * 0.3);
                break;
            }
        }
    }

    t = t + 0.02;
}

module.exports = {
    handler : animate
};

},{"../entities/entity":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/entity.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/services/mousedown.js":[function(require,module,exports){
var Entity = require('../entities/entity');

function mousedown(e, app, ctx, data) {
    if (app.getState() === 'playing') {
        var entities = app.renderer.getEntitiesForPos(data);

        if (entities.length && !ctx.currentCard) {
            var entity = entities[entities.length - 1];
            var hand = app.game.player.hand;

            // Selecting a hand card
            if (entity.type.id === Entity.Types.Card && hand.has(entity.props.index)) {
                ctx.currentCard = hand.get(entity.props.index);
            }
        }
    }
}

module.exports = {
    events : ['mouse:down'],
    handler : mousedown
};

},{"../entities/entity":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/entity.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/services/mouseup.js":[function(require,module,exports){
var Entity = require('../entities/entity');

function mouseup(e, app, ctx, data) {
    var entities = app.renderer.getEntitiesForPos(data);

    if (entities.length) {
        var entity = entities[entities.length - 1];
        var bottom = entities[0];

        if (app.getState() === 'playing') {
            var currentCard = ctx.currentCard;
            var player = app.game.player;

            // Adding a card to the score pile
            if (bottom.type.id === Entity.Types.ScorePile && currentCard !== undefined) {
                player.play(currentCard.props.index, 'SCORE')

                currentCard.sprite.x = bottom.sprite.x;
                currentCard.sprite.y = bottom.sprite.y;
                currentCard.sprite.tint = 0xFFFFFF;

                player.hand.remove(currentCard.props.index);
            }

            // Adding a card to the effect pile
            if (bottom.type.id === Entity.Types.EffectPile && currentCard !== undefined && player.hand.size() > 1) {
                player.play(currentCard.props.index, 'EFFECT');

                currentCard.sprite.x = bottom.sprite.x;
                currentCard.sprite.y = bottom.sprite.y;
                currentCard.sprite.tint = 0xFFFFFF;

                player.hand.remove(currentCard.props.index);
            }

            // Snap the score pile 
            if (bottom.type.id === Entity.Types.ScorePile) {
                player.snap();
            }
        }

        if (app.getState() === 'connected') {
            // Join the game
            if (entity.type.id  === Entity.Types.Button) {
                app.transition('joining');
            }    
       }

       ctx.currentCard = undefined;
    }
}

module.exports = {
    events : ['mouse:up'],
    handler : mouseup
};

},{"../entities/entity":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/entity.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/services/move.js":[function(require,module,exports){
var Entity = require('../entities/entity');

function mousemove(e, app, ctx, data) {
    var pos = app.renderer.getLocalPosition(data);

    if (app.getState() === 'playing') {
        var currentCard = ctx.currentCard;
        var highlighted = ctx.highlighted;

        if (currentCard) {
            currentCard.sprite.position.x = pos.x;
            currentCard.sprite.position.y = pos.y;

            // TODO: Update card topic
        } else {
            var entities = app.renderer.getEntitiesForPos(data);
            var game = app.game;

            if (entities.length && game.getState() === 'playing') {
                var entity = entities[entities.length - 1];

                if (entity.type.id === Entity.Types.Card && game.player.hand.has(entity.props.index)) {
                    if (highlighted) {
                        highlighted.sprite.tint = 0xFFFFFF;
                    }

                    highlighted = entities[entities.length - 1]; 
                }

                if (highlighted) {
                    highlighted.sprite.tint = 0xFFFF00;
                }
            } else {
                if (highlighted) {
                    highlighted.sprite.tint = 0xFFFFFF; 
                    highlighted = undefined;
                }
            }

            ctx.highlighted = highlighted;
        }
    }
}

module.exports = {
    events : ['mouse:move'],
    handler : mousemove
};

},{"../entities/entity":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/entities/entity.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/resnappt.js":[function(require,module,exports){
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

},{"./data/transport":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/data/transport.js","./game/game":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/game.js","./game/renderer":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/renderer.js","./game/scene-manager":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/scene-manager.js","./game/scenes/connecting":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/scenes/connecting.js","./game/scenes/end":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/scenes/end.js","./game/scenes/error":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/scenes/error.js","./game/scenes/game":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/scenes/game.js","./game/scenes/join":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/scenes/join.js","./game/scenes/title":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/scenes/title.js","./game/service-manager":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/service-manager.js","./game/services/animate":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/services/animate.js","./game/services/mousedown":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/services/mousedown.js","./game/services/mouseup":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/services/mouseup.js","./game/services/move":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/game/services/move.js","./util/curry":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/util/curry.js","./util/fsm":"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/util/fsm.js"}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/util/coords.js":[function(require,module,exports){
// Reference screen size
var refW = 2048;
var refH = 1536;

// Viewport render dimensions (pixels)
var width = Math.max(window.innerWidth, document.body.clientWidth);
var height = Math.max(window.innerHeight, document.body.clientHeight);

// Midpoint from screen space
var midW = width / 2;
var midH = height / 2;


function ratio(w, h) {
    return h / w;
}

function scaleSize(w, h) {
    var dw = w / refW;
    var dh = h / refH;

    return dh < dw ? { x : dh, y : dh } : { x : dw, y : dw };
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

},{}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/util/curry.js":[function(require,module,exports){
var sl = Array.prototype.slice;

function curry() {
    var args = sl.call(arguments, 0);
    var fn = args.shift();

    return function() {
        fn.apply(fn, args.concat(sl.call(arguments, 0)));
    }
};

module.exports = curry;

},{}],"/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/util/fsm.js":[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;

/**
 * Minimal finite state machine implementation. Allows directed transitions
 * between states.
 * <P>
 * States are provided as an object, with each key being single distinct state.
 * Each state's value within the object should be an array of strings, which
 * dictates the available states that are legal to transition to.
 * <P>
 * If a state may transition to any other state, the string <code>'*'</code>
 * may be provided instead of an array.
 * <P>
 * If a state is terminal, it should simply provide an empty array.
 *
 * @example
 * // Create a state machine with three states:
 * // 'a' may transition to 'b' or 'c'
 * // 'b' is a terminal state
 * // 'c' may transition to any state
 *
 * var states = {
 *     a : ['b', 'c'],
 *     b : [],
 *     c : '*'
 * };
 *
 * var fsm = FSM.create('a', states);
 *
 * states.change('c'); // => true
 * states.change('a'); // => true
 * states.change('b'); // => true
 * states.change('c'); // => false
 * states.change('a'); // => false
 *
 * @constructor
 * @param String initial - The initial state that this FSM should be in.
 * @param Object states - The set of possible states to transition between
 */
function FSM(initial, states) {
    var emitter = new EventEmitter(); 

    var current = states[initial];

    var self = this;

    /**
     * The current state
     *
     * @memberof FSM
     */
    this.state = initial;

    /**
     * Change the state. Will return whether the transition was allowed or not.
     *
     * @function FSM#change
     */
    this.change = function change(state) {
        if (self.state === state) {
            return true;
        }

        if (states[state] && (current === '*' || current.indexOf(state) > -1)) {
            current = states[state];
            var old = self.state;

            self.state = state;
            emitter.emit('change', old, state);

            return true;
        }

        return false;
    };

    this.on = emitter.on.bind(emitter);
}

module.exports = {
    create : function create(initial, states) {
        return new FSM(initial, states);
    }
}

},{"events":"/Users/tmclaughlan/.node/lib/node_modules/watchify/node_modules/browserify/node_modules/events/events.js"}]},{},["/Users/tmclaughlan/DEMOWEEK/resnappt/src/client/app.js"]);
