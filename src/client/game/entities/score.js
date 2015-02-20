var Entity = require('./entity');

var Score = Entity.type('Score', {
    style : {
        font : "bold 64px LibianRunic",
        fill : "white"
    } 
});

function ScoreFactory(x, y, text) {
    return Entity.createText(Score, {
        x : x,
        y : y,
        text : text
    });
};

module.exports = ScoreFactory;
