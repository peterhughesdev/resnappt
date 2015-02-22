var Entity = require('./entity');

var CardBack = Entity.type('CardBack', {
    width : 133,
    height : 200,
    texture : '/images/cards/backface.png'
});

function CardBackFactory(x, y, data) {
    return Entity.create(CardBack, {
        x : x,
        y : y,
        index : data.index
    });
}

module.exports = CardBackFactory;
