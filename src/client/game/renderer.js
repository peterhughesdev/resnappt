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
