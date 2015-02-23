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
