var Entity = require('./entity');

var Text = Entity.type('Text', {});

function TextFactory(x, y, text, size, colour, align, shadow) {
    size = size || 64;
    colour = colour || 'white';
    align = align || 'left';
    shadow = shadow === undefined ? true : shadow;

    Text.style = {
        font : "bold "+size+"px LibianRunic",
        fill : colour,
        align : align,
        dropShadow : shadow
    };

    return Entity.createText(Text, {
        x : x,
        y : y,
        text : text
    });
};

module.exports = TextFactory;
