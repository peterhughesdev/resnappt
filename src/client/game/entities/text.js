var Entity = require('./entity');

var Text = Entity.type('Text', {
    style : {
        font : "bold 64px LibianRunic",
        fill : "white"
    } 
});

function TextFactory(x, y, text) {
    return Entity.createText(Text, {
        x : x,
        y : y,
        text : text
    });
};

module.exports = TextFactory;
