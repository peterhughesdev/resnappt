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

// Create a new entity from a specified type and map of properties
Entity.create = function(type, properties) {
    var s = new PIXI.Sprite(PIXI.Texture.fromImage(type.texture, true));

    // Scale the width according to screen space
    var scaled = coords.scaleSize(type.width, type.height);
    s.width = scaled.width;
    s.height = scaled.height;

    // Normalise position according to screen space
    var norm = coords.translateToScreen(properties.x, properties.y);
    s.position.x = norm.x;
    s.position.y = norm.y;
   
    s.interactive = type.interactive;

    // Center anchor
//    s.anchor.x = 0.5;
//    s.anchor.y = 0.5;

    //s.pivot.set(opts.width / 2, opts.height / 2);

    return new Entity(type, properties, s);
};

module.exports = Entity;
