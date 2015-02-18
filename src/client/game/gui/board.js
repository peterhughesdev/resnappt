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
