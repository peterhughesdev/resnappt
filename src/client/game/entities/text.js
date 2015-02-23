var Entity = require('./entity');

var Text = Entity.type('Text', {});

function TextFactory(x, y, text, size, colour) {
    if (!size) {
        size = 64;
    }
    if (!colour) {
        colour = 'white';
    }
    Text.style = {
        font : "bold "+size+"px LibianRunic",
        fill : colour
    };
    return Entity.createText(Text, {
        x : x,
        y : y,
        text : text
    });
};

module.exports = TextFactory;
