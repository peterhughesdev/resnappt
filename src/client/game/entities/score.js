var Entity = require('./entity');

var Score = Entity.type('Score', {
    style : {
        font : "bold 40px Arial",
        fill : "red"
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
