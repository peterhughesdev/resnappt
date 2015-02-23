var Entity = require('./entity');

var ScorePile = Entity.type('ScorePile', {
    width : 300,
    height : 300,
    texture : '/images/score.png'
});

function ScorePileFactory(x, y) {
    return Entity.create(ScorePile, {
        x : x,
        y : y
    });
}

module.exports = ScorePileFactory;
