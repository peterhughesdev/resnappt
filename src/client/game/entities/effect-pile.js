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
