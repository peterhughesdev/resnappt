(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/Peter/Dev/Projects/Resnappt/src/client/app.js":[function(require,module,exports){
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


},{"./resnappt":"/Users/Peter/Dev/Projects/Resnappt/src/client/resnappt.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/data/transport.js":[function(require,module,exports){
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
        var sub = session.subscribe(topic, log);
        
        if (type) {
            sub = sub.transform(type);
        }

        if (cb) {
            sub.on('update', cb);
        }

        console.log('Subscribing to topic: ' + topic);
        return sub;
    };

    this.unsubscribe = function(topic) {
        return session.unsubscribe(topic);
    };

    this.updateCardTopic = function(index, x, y) {
        var cardTopic = sessionTopic + '/hand/' + index;
    
        session.topics.update(cardTopic + '/x', x);
        session.topics.update(cardTopic + '/y', y);
    };

    this.addCardTopic = function(index, x, y, cb) {
        var mx = new diffusion.metadata.Decimal(x, 20);
        var my = new diffusion.metadata.Decimal(y, 20);

        var cardTopic = sessionTopic + '/hand/' + index;
        session.topics.add(cardTopic, index).on('complete', function() {
            session.topics.add(cardTopic + '/x', mx).on('complete', function() {
                session.topics.add(cardTopic + '/y', my).on('complete', function() {
                    cb();
                });
            });

        });
    };

    this.removeCardTopic = function(index) {
        session.topics.remove(sessionTopic + '/hand/' + index).on('complete', function() {
            console.log('Removed card topic: ' + index);
        });
    };

    this.establishCommandTopic = function(callback) {
        sessionTopic = 'sessions/' + session.sessionID;
        commandTopic = sessionTopic + '/command';


        // Oh dear lord
        session.topics.removeWithSession(sessionTopic).on('complete', function() {
            session.topics.add(sessionTopic, '').on('complete', function() {
                session.topics.add(sessionTopic + '/command', '').on('complete', function() {
                    session.topics.add(sessionTopic + '/hand', JSON.stringify([])).on('complete', function() {
                        session.topics.add(sessionTopic + '/score', JSON.stringify(0)).on('complete', callback).on('error', log);
                    }).on('error', log);
                }).on('error', log);
            }).on('error', log);
        }).on('error', log); 
    };
}

Transport.prototype = new EventEmitter();

module.exports = Transport;

},{"events":"/usr/local/lib/node_modules/watchify/node_modules/browserify/node_modules/events/events.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/background.js":[function(require,module,exports){
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

},{"./entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/board.js":[function(require,module,exports){
var Entity = require('./entity');

var Board = Entity.type('Board', {
    width : 660,
    height : 660,
    texture : '/images/board.png'
});

function BoardFactory(x, y, id) {
    return Entity.create(Board, {
        x : x,
        y : y,
        name : id
    });
};

module.exports = BoardFactory;

},{"./entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/button.js":[function(require,module,exports){
var Entity = require('./entity');

var Button = Entity.type('Button', {
    width : 200,
    height : 200,
    texture : '/images/effect.png'
});

function ButtonFactory(x, y) {
    return Entity.create(Button, {
        x : x,
        y : y
    });
}

module.exports = ButtonFactory;

},{"./entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/card.js":[function(require,module,exports){
var Entity = require('./entity');
var Text = require('./text');

var Card = Entity.type('Card', {
    width : 200,
    height : 300,
    texture : '/images/card.jpg'
});

function CardFactory(x, y, data) {
    var rune = '';
    switch (data.rune) {
    case 'a':
        rune = '!';
        break;
    case 'b':
        rune = '"';
        break;
    case 'c':
        rune = '#';
        break;
    case 'd':
        rune = '$';
        break;
    };


    var rune = Text(55, 32, rune, 60, 'black', null, false);
    var duration = Text(70, 115, data.effect.duration, 48, 'black', null, false);
    var score = Text(72, -125, data.value, 48, 'black', null, false);
    var name = Text(-20, -122, data.effect.name, 32, 'black', null, false);

    name.sprite.width = 230;

    var texture = '/images/cards/' + data.effect.name.toLowerCase() + '.png';

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

},{"./entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js","./text":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/text.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/cardback.js":[function(require,module,exports){
var Entity = require('./entity');

var CardBack = Entity.type('CardBack', {
    width : 200,
    height : 300,
    texture : '/images/cards/backface.png'
});

function CardBackFactory(x, y, data) {
    return Entity.create(CardBack, {
        x : x,
        y : y,
        index : data.index
    });
}

module.exports = CardBackFactory;

},{"./entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/effect-pile.js":[function(require,module,exports){
var Entity = require('./entity');

var EffectPile = Entity.type('EffectPile', {
    width : 200,
    height : 200,
    texture : '/images/effect.png'
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

},{"../../util/coords":"/Users/Peter/Dev/Projects/Resnappt/src/client/util/coords.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/player-gui.js":[function(require,module,exports){
var Entity = require('./entity');

var GUI = Entity.type('PlayerGUI', {
    width : 400,
    height : 400,
    texture : '/images/transparent.png'
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
var Entity = require('./entity');

var ScorePile = Entity.type('ScorePile', {
    width : 300,
    height : 300,
    texture : '/images/score.png'
});

function ScorePileFactory(x, y) {
    return Entity.create(ScorePile, {
        x : x,
        y : y
    });
}

module.exports = ScorePileFactory;

},{"./entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/snap-ui.js":[function(require,module,exports){
var Entity = require('./entity');
var Text = require('./text');

var SnapGUI = Entity.type('SnapGUI', {
    width : 200,
    height : 200,
    texture : '/images/effect.png'
});

function SnapGUIFactory(x, y) {
    var circle = Entity.create(SnapGUI, {
        x : x,
        y : y
    });

    var text = Text(0, -10, '', 80, 'white');

    var filter = new PIXI.ColorMatrixFilter();

    filter.matrix = [0.25, 0.00, 0.50, 0.00,
                     0.00, 1.00, 0.00, 0.00,
                     0.50, 0.00, 1.00, 0.00,
                     0.00, 0.00, 0.00, 1.00];

    circle.sprite.filters = [filter];

    circle.sprite.addChild(text.sprite);
    circle.text = text;
    return circle;
}

module.exports = SnapGUIFactory;

},{"./entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js","./text":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/text.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/text.js":[function(require,module,exports){
var Entity = require('./entity');

var Text = Entity.type('Text', {});

function TextFactory(x, y, text, size, colour, align, shadow) {
    size = size || 64;
    colour = colour || 'white';
    align = align || 'left';
    shadow = shadow === undefined ? true : shadow;

    Text.style = {
        font : "bold "+size+"px LibianRunic",
        fill : colour,
        align : align,
        dropShadow : shadow
    };

    return Entity.createText(Text, {
        x : x,
        y : y,
        text : text
    });
};

module.exports = TextFactory;

},{"./entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/title.js":[function(require,module,exports){
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

},{"./entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/game.js":[function(require,module,exports){
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

},{"../util/fsm":"/Users/Peter/Dev/Projects/Resnappt/src/client/util/fsm.js","./player":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/player.js","events":"/usr/local/lib/node_modules/watchify/node_modules/browserify/node_modules/events/events.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/hand.js":[function(require,module,exports){
var Card = require('./entities/card');
var CardBack = require('./entities/cardback');

function Hand(game, topic, turn, isPlayer, x, y) {
    var cards = [];
    var cardByIndex = {};

    var offset = turn % 2 ? 200 : 50;

    var self = this;

    function position(card, i) {
        card.sprite.position.x = x + (i * 135) - offset;
        card.sprite.position.y = y;
    }

    function reassign(c, i) {
        cardByIndex[c.props.index] = i;
    }
    
    function removed(c) {
        return this.indexOf(c.props.index) === -1;
    }

    function getIndex(d) {
        return d.index;
    }

    function getPropIndex(c) {
        return c.props.index;
    }

    this.update = function(data) {
        data.forEach(self.add);

        var ids = data.map(getIndex);

        cards.filter(removed, ids)
             .map(getPropIndex)
             .forEach(self.remove);
    };

    this.add = function(data) {
        if (cardByIndex[data.index] === undefined) {
            var i = cards.length;
            var card;

            if (isPlayer) {
                card  = Card(x, y, data); 

                position(card, i);
                
                game.transport.addCardTopic(data.index, card.sprite.position.x, card.sprite.position.y, function() {
                    game.renderer.add(card, 10);
                });
            } else {
                card = CardBack(x, y, data);
                
                position(card, i);
                
                var cardTopic = topic + 'hand/' + data.index;

                game.transport.subscribe(cardTopic + '/x', Number, function(x) {
                    card.sprite.position.x = x;
                });

                game.transport.subscribe(cardTopic + '/y', Number, function(y) {
                    card.sprite.position.y = y;
                });

                game.transport.subscribe(cardTopic).on('unsubscribed', function() {
                    self.remove(data.index);
                });

                game.renderer.add(card, 5);
            }
            

            cards.push(card); 
            cards.forEach(reassign);
        }
    };

    this.remove = function(index) {
        if (cardByIndex[index] !== undefined) {
            cards.splice(cardByIndex[index], 1).forEach(game.renderer.remove);
            delete cardByIndex[index];
            
            cards.forEach(reassign);

            if (isPlayer) {
                game.transport.removeCardTopic(index);
            }
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

},{"./entities/card":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/card.js","./entities/cardback":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/cardback.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/player.js":[function(require,module,exports){
var PlayerGUI = require('./entities/player-gui');
var Text = require('./entities/text');

var Hand = require('./hand');

// Player GUIs
var playerPosition = [
    { x : 200, y : 200 },
    { x : 1848, y : 200 },
    { x : 200, y : 1336 },
    { x : 1848, y : 1336 }
];

function Player(app, session, turn, isPlayer) { 
    var pos = playerPosition[turn];

    var yOffset = turn < 2 ? 0 : 315;
    var xOffset = turn % 2 ? 96 : 0;

    var score = Text(-60 - xOffset, 170 - yOffset, 'Score : 0', 28);
    var name = Text(-60 - xOffset, 145 - yOffset, 'Player ' + turn, 28);
    var icon = Text(60 - xOffset, 145 - yOffset, 'Playing', 28);

    var gui = PlayerGUI(pos.x, pos.y, name, score, icon);

    var topic = 'sessions/' + session + '/';
    var active = false;
    icon.sprite.alpha = 0;

    var hand = new Hand(app, topic, turn, isPlayer, pos.x, pos.y);
    this.hand = hand;

    app.transport.subscribe(topic + 'score').on('update', function(newScore) {
        score.sprite.setText('Score : '+newScore);
    }).on('unsubscribed', function() {
        active = false;
        icon.sprite.alpha = 0;

        score.sprite.setText('Left game');
    });

    app.transport.subscribe(topic + 'hand', JSON.parse, hand.update);

    this.play = function(card, pile) {
        hand.remove(card);
        app.transport.dispatch('PLAY', {
            card : card,
            pile : pile
        }); 
    };

    this.snap = function() {
        app.transport.dispatch('SNAP', {});
    };

    this.remove = function() {
        active = false;
        icon.sprite.alpha = 0;

        app.transport.unsubscribe(topic + 'score');
        app.transport.unsubscribe(topic + 'hand');
    };

    this.setActive = function() {
        icon.sprite.alpha = 1;
        active = true;

        console.log('Player (' + isPlayer + ') ' + session + ' is active');
    };

    this.setInactive = function() {
        icon.sprite.alpha = 0;
        active = false;
        
        console.log('Player (' + isPlayer + ') ' + session + ' is inactive');
    };

    this.isActive = function() {
        return active;
    };

    this.getGUI = function() {
        return gui;
    };
}

module.exports = Player;

},{"./entities/player-gui":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/player-gui.js","./entities/text":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/text.js","./hand":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/hand.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/renderer.js":[function(require,module,exports){
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

                    container.children.sort(byDepth);
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

    function byDepth(a, b) {
        return a.z === b.z ? 0 : (a.z < b.z ? -1 : 1);
    }

    this.add = function(entity, z) {
        z = z || 0;

        entity.sprite.z = z;

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

},{"../util/coords":"/Users/Peter/Dev/Projects/Resnappt/src/client/util/coords.js","../util/curry":"/Users/Peter/Dev/Projects/Resnappt/src/client/util/curry.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/scene-manager.js":[function(require,module,exports){
var FSM = require('../util/fsm');

function Container(app) {
    var added = [];
    
    this.add = function(entity, z) {
        app.renderer.add(entity, z);
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

},{"../util/fsm":"/Users/Peter/Dev/Projects/Resnappt/src/client/util/fsm.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/scenes/connecting.js":[function(require,module,exports){
var Text = require('../entities/text');

function ConnectingScene(app, container) {
    var connectingText = Text(1024, 700, 'Connecting...', 64, 'white');

    this.enter = function(done) {
        container.add(connectingText);
        done();
    };

    this.leave = function(done) {
        done();
    };
}

module.exports = ConnectingScene;

},{"../entities/text":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/text.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/scenes/end.js":[function(require,module,exports){
var Background = require('../entities/background');
var Text = require('../entities/text');

function EndScene(app, container) {
    var endingText = Text(1024, 400, 'Game ove!', 64, 'white');
    var bg = Background();

    var scoreSub;

    this.enter = function(done) {
        container.add(bg);
        container.add(endingText);
        
        scoreSub = app.transport.subscribe('summary', JSON.parse).on('update', displaySummary);

        done();
    };

    this.leave = function(done) {
        done();
    };

    function displaySummary(results) {
        var highest = results.reduce(function(prev, curr) {
            return prev.score < curr.score ? curr : prev;
        }, results[0]);
        
        results.forEach(function(result, i) {
            var resY = 650 + (80 * i);
            var colour = result === highest ? '#FFD633' : 
                         (result.playerID  === app.transport.sessionID ? '#8CE8FF' : 'white');
                    
            var resText = Text(1024, resY, 'Player ' + i + ' -- ' + result.score, 50, colour);
            container.add(resText);
        });
    }

    function byScore(r1, r2) {
        return r1.score < r2.score ? 1 : -1;
    }
}

module.exports = EndScene;

},{"../entities/background":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/background.js","../entities/text":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/text.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/scenes/error.js":[function(require,module,exports){
var Text = require('../entities/text');

function ErrorScene(app, container) {
    var message = Text(1024, 700, 'Error :(', 64, 'red');

    this.enter = function(done) {
        container.add(message);
        done();
    };

    this.leave = function(done) {
        done();
    };
}

module.exports = ErrorScene;

},{"../entities/text":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/text.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/scenes/game.js":[function(require,module,exports){
var EffectPile = require('../entities/effect-pile');
var ScorePile = require('../entities/score-pile');
var Entity = require('../entities/entity');
var Text = require('../entities/text');

var Background = require('../entities/background');
var Board = require('../entities/board');
var Card = require('../entities/card');
var SnapGUI = require('../entities/snap-ui');

var effectCardPos = [
    { x : 640, y : 768 },
    { x : 1024, y : 1152 },
    { x : 1408, y : 768 }
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

    var bg = Background();
    var board = Board(1024, 768, 'base');
    var snap = SnapGUI(1024, 384);
    var deck = Text(1024, 128, 'Dealing...', 48);
    
    // Subscribe to gameplay topics
    var stateSub;
    var turnSub;
    var deckSub;
    var snapSub;
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
        container.add(snap, 8);
        container.add(deck);

        // Setup board
        effectPiles.forEach(container.add);
        container.add(scorePile);

        turnSub = app.transport.subscribe('turn', String).on('update', updateTurn);
        deckSub = app.transport.subscribe('deck', String).on('update', updateDeck);
        snapSub = app.transport.subscribe('snap/timer', Number).on('update', updateSnap);

        scorePileSub = app.transport.subscribe('pile/score', JSON.parse).on('update', updateScorePile);
        effectPileSub = app.transport.subscribe('pile/effects', JSON.parse).on('update', updateEffectPile);

        stateSub = app.transport.subscribe('state', JSON.parse).on('update', endGame);

        app.game.start();

        done();
    };

    this.leave = function(done) {
        deckSub.off('update', updateDeck);
        snapSub.off('update', updateSnap);

        scorePileSub.off('update', updateScorePile);
        effectPileSub.off('update', updateEffectPile);

        stateSub.off('update', endGame);

        app.renderer.getEntities().filter(function(e) {
            return e.type.id === Entity.Types.Card || e.type.id === Entity.Types.CardBack;
        }).forEach(app.renderer.remove);

        done();
    };

    function endGame(res) {
        if (res.state === 'FINISHED') {
            app.game.end();
            app.transition('finished');
        }
    }

    function updateDeck(size) {
        deck.sprite.setText('Deck size : '+size);
    }

    function updateTurn() {
        snap.text.sprite.setText('');
    }

    function updateSnap(timer) {
        if (app.game.getState() === 'snapping') {
            snap.text.sprite.setText(timer);
        }
    }

    function updateScorePile(newScoreCard) {
        if (scoreCard) {
            container.remove(scoreCard);
        }

        scoreCard = Card(scoreCardPos.x, scoreCardPos.y, newScoreCard);
        container.add(scoreCard, 7);
    }

    function updateEffectPile(newEffectCards) {
        effectCards.forEach(container.remove);

        effectPiles.forEach(function(e, i) {
            if (i > newEffectCards.length) {
                effectPiles[i].sprite.alpha = 0;
            } else {
                effectPiles[i].sprite.alpha = 1;
            }
        });

        newEffectCards.forEach(function(data, i) {
            var pos = effectCardPos[i];
            var effectCard = Card(pos.x, pos.y, data);
            
            container.add(effectCard, 7);
            effectCards.push(effectCard);
        });
    }
}

module.exports = GameScene;

},{"../entities/background":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/background.js","../entities/board":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/board.js","../entities/card":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/card.js","../entities/effect-pile":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/effect-pile.js","../entities/entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js","../entities/score-pile":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/score-pile.js","../entities/snap-ui":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/snap-ui.js","../entities/text":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/text.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/scenes/join.js":[function(require,module,exports){
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

    var stateHandle;
    var playerLeft;

    this.enter = function(done) {
        container.add(bg);
        container.add(board);
        container.add(message);

        stateHandle = function(res, topic) {
            console.log(res);
            if (res.state === 'PLAYING') {
                res.players.forEach(function(p) {
                    app.game.addParticipant(p.playerID, p.turn, p.playerID === app.transport.sessionID);
                });

                app.transition('playing');
            }
        }

        playerLeft = function(reason, topic) {
            var session = topic.split('/')[1];
            app.game.remove()
        }

        playerSub = app.transport.subscribe('state', JSON.parse, stateHandle);
        done();

        // Put this here so we're guaranteed that the scene transition
        // has completed by the time we receive the status response
        app.transport.dispatch('READY', {
                sessionID : app.transport.sessionID
        });
    };

    this.leave = function(done) {
        playerSub.off('update', stateHandle);
        done();
    };
}

module.exports = JoinScene;

},{"../entities/background":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/background.js","../entities/board":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/board.js","../entities/text":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/text.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/scenes/title.js":[function(require,module,exports){
var Title = require('../entities/title');
var JoinBtn = require('../entities/button.js');
var Board = require('../entities/board');
var Background = require('../entities/background');
var Text = require('../entities/text');

function TitleScene(app, container) {
    var title = Title(1024, 768, '{resnappt}');
    var ready = JoinBtn(1024, 1152);
    var joinText = Text(0, -8, "join");
    var bg = Background();
    var boardDark = Board(1024, 768, 'dark');
    var boardLight = Board(1024, 768, 'light');
    var board = Board(1024, 768, 'base');

    var rune1 = Text(200, 200, '!', 192);
    var rune2 = Text(1848, 200, '"', 192);
    var rune3 = Text(200, 1336, '#', 192);
    var rune4 = Text(1848, 1336, '$', 192);

    this.enter = function(done) {
        container.add(bg);
        container.add(board);
        container.add(boardDark);
        container.add(boardLight);
        container.add(title);
        container.add(rune1);
        container.add(rune2);
        container.add(rune3);
        container.add(rune4);

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
        });
    }

    this.leave = function(done) {
        var brighten = true;
        var id = setInterval(function() {
            title.sprite.alpha -= 0.01;
            ready.sprite.alpha -= 0.01;
            rune1.sprite.alpha -= 0.01;
            rune2.sprite.alpha -= 0.01;
            rune3.sprite.alpha -= 0.01;
            rune4.sprite.alpha -= 0.01;

            if (board.sprite.alpha < 1) {
                board.sprite.alpha += 0.002;
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

},{"../entities/background":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/background.js","../entities/board":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/board.js","../entities/button.js":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/button.js","../entities/text":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/text.js","../entities/title":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/title.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/service-manager.js":[function(require,module,exports){
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

var getModulationFilter = function(t, mode) {
    var filter = new PIXI.ColorMatrixFilter();

    var R = [1,0,0,0];
    var G = [0,1,0,0];
    var B = [0,0,1,0];
    var A = [0,0,0,1];

    switch(mode) {
    case 0:
        R = [0.5 + (Math.sin(t)*0.5), 0.00, 0.4 + (Math.sin(t*2)*0.4), 0.00];
        G = [0.00, 1.00, 0.00, 0.00];
        B = [0.4 + (Math.cos(t*2)*0.4), 0.5 + (Math.sin(t) * 0.5), 1.00, 0.00];
        A = [0.00, 0.00, 0.00, 0.6 + (Math.sin(t) * 0.4)];
        break;
    case 1:
        R = [0.6 + (Math.sin(t) * 0.4), 0.0, 0.4 + (Math.sin(t*2) * 0.4), 0.2 + (Math.sin(t) * 0.2)];
        G = [0.00, 0.7 + (Math.sin(t*2) * 0.3), 0.00, 0.00];
        B = [0.4 + (Math.cos(t)*0.3), 0.5 + (Math.sin(t) * 0.4), 0.00, 0.00];
        break;
    case 2:
        R = [0.7 + (Math.sin(t) * 0.3), 0, 0, 0];
        G = [0.1, 0.8 + (Math.sin(t*2) * 0.2), 0.1, 0];
        B = [0, 0.1, 0.8 * (Math.sin(t) * 0.2), 0];
        A = [0, 0, 0, 0.9 + (Math.sin(t/2.0) * 0.1)];
        break;
    case 3:
        break;
    }

    filter.matrix = [R[0], R[1], R[2], R[3],
                     G[0], G[1], G[2], G[3],
                     B[0], B[1], B[2], B[3],
                     A[0], A[1], A[2], A[3]];

    return filter;
};

function animate(app, ctx, dt) {
    var entities = app.renderer.getEntities();

    //entities.filter(function(e) { 
    //    return e.type.id === Entity.Types.Card;
    //}).forEach(function(card) {
    //    if (card.props.fading) {
    //        card.sprite.alpha++;
    //    }

    //    if (card.sprite.alpha >= 1) {
    //        card.props.fading = false;
    //    }
    //});
    if (app.getState() === 'playing') {
        var board = entities.filter(function(e) {
            return e.type.id === Entity.Types.Board;
        })[0];
        var snap = entities.filter(function(e) {
            return e.type.id === Entity.Types.SnapGUI;
        })[0];
        if (app.game.getState() === 'snapping') {
            if (snap) {
                snap.sprite.filters = [getModulationFilter(t, 1)];
            }
            if (board) {
                board.sprite.filters = [getModulationFilter(t, 0)];
            }
        } else {
            if (board) {
                board.sprite.filters = [getModulationFilter(t, 3)];
            }
            if (snap) {
                snap.sprite.filters = [getModuleationFilter(t, 3)];
            }
        }
        var effects = entities.filter(function(e) {
            return e.type.id == Entity.Types.EffectPile;
        });

        effects.forEach(function(effect) {
            effect.sprite.filters = [getModulationFilter(t, 2)];
        });
    }
    if (app.getState() === 'connected') {
        var title = entities.filter(function(e) {
            return e.type.id === Entity.Types.Title;
        })[0];

        if (title) {
            title.sprite.width = title.sprite.width + (Math.sin(t) * 0.1024);
            title.sprite.height = title.sprite.height + (Math.sin(t) * 0.0768);
        }

        var join = entities.filter(function(e) {
            return e.type.id === Entity.Types.Button;
        })[0];

        if (join) {
            join.sprite.filters = [getModulationFilter(t, 0)];
        }

        var runes = entities.filter(function(e) {
            return e.type.id === Entity.Types.Text;
        });

        for (var r in runes) {
            var rune = runes[r];
            rune.sprite.width = rune.sprite.width + (Math.sin(t / 3.0) * 0.2048);
            rune.sprite.height = rune.sprite.height + (Math.sin(t / 3.0) * 0.1536);
            rune.sprite.alpha = 0.5 + (Math.cos(t / 7.0) * 0.5);
        }
        var boards = entities.filter(function(e) {
            return e.type.id === Entity.Types.Board;
        });

        for (var b in boards) {
            var board = boards[b];
            switch (board.props.name) {
            case 'dark':
                board.sprite.alpha = 0.6 + (Math.sin(t*2) * 0.4);
                break;
            case 'light':
                board.sprite.alpha = 0.4 + (Math.cos(t) * 0.3);
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

},{"../entities/entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/services/mousedown.js":[function(require,module,exports){
var Entity = require('../entities/entity');

function mousedown(e, app, ctx, data) {
    if (ctx.currentCard === undefined && app.getState() === 'playing') {
        var entities = app.renderer.getEntitiesForPos(data);

        if (entities.length) {
            var hand = app.game.player.hand;

            // Selecting a hand card - traverse backwards through the entities until we find a card
            for (var i = entities.length - 1; i >= 0; --i) {
                var entity = entities[i];           

                if (entity.type.id === Entity.Types.Card && hand.has(entity.props.index)) {
                    ctx.currentCard = hand.get(entity.props.index);
                    break;
                }
            }

            if (ctx.currentCard) {
                hand.get().forEach(function(card) {
                    app.renderer.remove(card);

                    if (card === ctx.currentCard) {
                        app.renderer.add(card, 11);
                    } else {
                        app.renderer.add(card, 10);
                    }
                });
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
        var appState = app.getState();

        if (appState === 'playing') {
            var currentCard = ctx.currentCard;
            var gameState = app.game.getState();
            var player = app.game.player;

            if (currentCard && player.isActive()) {
                for (var i = 0; i < entities.length; ++i) {
                    var bottom = entities[i];

                    // Adding a card to the score pile
                    if (bottom.type.id === Entity.Types.ScorePile) {
                        player.play(currentCard.props.index, 'SCORE')
                        app.transport.updateCardTopic(currentCard.props.index, -1000, -1000);
                        app.game.endRound();
                        break;
                    }

                    // Adding a card to the effect pile
                    if (bottom.type.id === Entity.Types.EffectPile && player.hand.size() > 1) {
                        player.play(currentCard.props.index, 'EFFECT');
                        app.transport.updateCardTopic(currentCard.props.index, -1000, -1000);
                        break;
                    }
                }
            }

            if (gameState === 'snapping') {
                for (var i = 0; i < entities.length; ++i) {
                    var entity = entities[i]; 
                    
                    // Snap the score pile 
                    if (entity.type.id === Entity.Types.ScorePile) {
                        player.snap();
                        break;
                    }
                }
            }
        }

        if (appState === 'connected') {
            for (var i = 0; i < entities.length; ++i) {
                var entity = entities[i];

                // Join the game
                if (entity.type.id  === Entity.Types.Button) {
                    app.transition('joining');
                    break;
                }    
            }
        }

    }
    
    ctx.currentCard = undefined;
}

module.exports = {
    events : ['mouse:up'],
    handler : mouseup
};

},{"../entities/entity":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/entities/entity.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/game/services/move.js":[function(require,module,exports){
var Entity = require('../entities/entity');

var prevX;
var prevY;

function mousemove(e, app, ctx, data) {
    var pos = app.renderer.getLocalPosition(data);

    if (app.getState() === 'playing') {
        var currentCard = ctx.currentCard;
        var highlighted = ctx.highlighted;

        if (currentCard && (pos.x != prevX || pos.y != prevY)) {
            currentCard.sprite.position.x = pos.x;
            currentCard.sprite.position.y = pos.y;

            prevX = pos.x;
            prevY = pos.y;

            app.transport.updateCardTopic(currentCard.props.index, pos.x, pos.y);            
        } else {
            var entities = app.renderer.getEntitiesForPos(data);
            var player = app.game.player;

            if (entities.length && app.game.getState() === 'playing' && player && player.isActive()) {
                for (var i = entities.length - 1; i >= 0; --i) {
                    var entity = entities[i];

                    if (entity.type.id === Entity.Types.Card && player.hand.has(entity.props.index)) {
                        if (highlighted) {
                            highlighted.sprite.tint = 0xFFFFFF;
                        }

                        highlighted = entity;
                        break;
                    }
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
    } else {
        if (ctx.current) {
            app.renderer.remove(ctx.current);
        }

        ctx.current = undefined;
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
        'playing'        : ['pre:finished', 'pre:error'],
        'pre:spectating' : ['spectating', 'pre:error'],
        'spectating'     : ['pre:finished', 'pre:error'],
        'pre:finished'   : ['finished', 'pre:error'],
        'finished'       : ['pre:connected', 'pre:error']
    });

    if (opts.debug) {
        diffusion.log('debug');
    } else {
        diffusion.log('info');
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

},{"./data/transport":"/Users/Peter/Dev/Projects/Resnappt/src/client/data/transport.js","./game/game":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/game.js","./game/renderer":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/renderer.js","./game/scene-manager":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/scene-manager.js","./game/scenes/connecting":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/scenes/connecting.js","./game/scenes/end":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/scenes/end.js","./game/scenes/error":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/scenes/error.js","./game/scenes/game":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/scenes/game.js","./game/scenes/join":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/scenes/join.js","./game/scenes/title":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/scenes/title.js","./game/service-manager":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/service-manager.js","./game/services/animate":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/services/animate.js","./game/services/mousedown":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/services/mousedown.js","./game/services/mouseup":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/services/mouseup.js","./game/services/move":"/Users/Peter/Dev/Projects/Resnappt/src/client/game/services/move.js","./util/curry":"/Users/Peter/Dev/Projects/Resnappt/src/client/util/curry.js","./util/fsm":"/Users/Peter/Dev/Projects/Resnappt/src/client/util/fsm.js"}],"/Users/Peter/Dev/Projects/Resnappt/src/client/util/coords.js":[function(require,module,exports){
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

},{}],"/Users/Peter/Dev/Projects/Resnappt/src/client/util/curry.js":[function(require,module,exports){
var sl = Array.prototype.slice;

function curry() {
    var args = sl.call(arguments, 0);
    var fn = args.shift();

    return function() {
        fn.apply(fn, args.concat(sl.call(arguments, 0)));
    }
};

module.exports = curry;

},{}],"/Users/Peter/Dev/Projects/Resnappt/src/client/util/fsm.js":[function(require,module,exports){
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

},{"events":"/usr/local/lib/node_modules/watchify/node_modules/browserify/node_modules/events/events.js"}],"/usr/local/lib/node_modules/watchify/node_modules/browserify/node_modules/events/events.js":[function(require,module,exports){
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
