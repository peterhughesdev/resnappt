var Entity = require('./entity');

var ScorePile = Entity.type('ScorePile', {
    width : 108,
    height : 150,
    texture : '/images/effect-placement.png'
});

function ScorePileFactory(x, y) {
    return Entity.create(ScorePile, {
        x : x,
        y : y
    });
}

module.exports = ScorePileFactory;
