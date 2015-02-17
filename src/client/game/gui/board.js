var EffectPile = require('../entities/effect-pile');

function Board(game, renderer) {
    var effectPiles = [
        EffectPile(100, 100),
        EffectPile(100, 350),
        EffectPile(100, 600)
    ];

    effectPiles.forEach(renderer.add);

    var scorePile = EffectPile(320, 250);
    renderer.add(scorePile);
}

module.exports = Board;
