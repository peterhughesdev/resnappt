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
