var Entity = require('./entity');

var ScorePile = Entity.type('ScorePile', {
    width : 200,
    height : 300,
    texture : '/images/effect-placement.png'
});

function ScorePileFactory(x, y) {
    return Entity.create(ScorePile, {
        x : x,
        y : y
    });
}

module.exports = ScorePileFactory;
