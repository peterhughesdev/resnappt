var EntityID = 0;

var defaultEntity = {
    x : 0,
    y : 0,
    
    width : 100,
    height : 100,
    interactive : false,

    tick : function() { },

    mouseup : function() { },
    mousedown : function() { },

    mouseout : function() { },
    mouseover : function() { },
    mousemove : function() { }
};

function extend(base, target) {
    for (var prop in base) {
        if (target[prop] === undefined) {
            target[prop] = base[prop];
        }
    }

    return target;
} 

function Entity(id, opts, sprite) {
    this.id = id;
    this.opts = opts;
    this.sprite = sprite;

    this.tick = opts.tick.bind(this);

    sprite.mouseup = opts.mouseup.bind(this); 
    sprite.mouseout = opts.mouseout.bind(this);
    sprite.mouseover = opts.mouseover.bind(this);
    sprite.mousedown = opts.mousedown.bind(this);
    sprite.mousemove = opts.mousemove.bind(this);
    sprite.touchmove = opts.mousemove.bind(this);
}

Entity.create = function(opts, base) {
    base = base || defaultEntity;
    opts = extend(base, opts);

    var s = new PIXI.Sprite(PIXI.Texture.fromImage(opts.texture, true));

    s.width = opts.width;
    s.height = opts.height;

    s.position.x = opts.x;
    s.position.y = opts.y;

    s.interactive = opts.interactive;

    s.anchor.x = 0.5;
    s.anchor.y = 0.5;

    //s.pivot.set(opts.width / 2, opts.height / 2);

    return new Entity(EntityID++, opts, s);
};

module.exports = Entity;
