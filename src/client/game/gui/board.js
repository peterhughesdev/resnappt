var EffectPile = require('../entities/effect-pile');
var ScorePile = require('../entities/score-pile');
var Score = require('../entities/score');
var Card = require('../entities/card');

function Board(game) {
    var effectPiles = [
        EffectPile(100, 100),
        EffectPile(100, 350),
        EffectPile(100, 600)
    ];

    effectPiles.forEach(game.render);

    var scorePile = ScorePile(320, 250);
    game.render(scorePile);
}

module.exports = Board;
