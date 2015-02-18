var Entity = require('./entity');

var Rune = Entity.type('Rune', {
    style : { 
        font : "bold 55px Arial",
        fill : "blue"
    }
});

var Card = Entity.type('Card', {
    width : 60,
    height : 102,
    texture : '/images/card.jpg'
});

function CardFactory(x, y, rune, score) {
    var r = Entity.createText(Rune, {
        x : -20,
        y : -40,
        text : rune
    });

    var card = Entity.create(Card, {
        x : x,
        y : y,
        data : {
           rune : rune,
           score : score
        }
    });

    card.sprite.addChild(r.sprite);

    return card;
};

module.exports = CardFactory;
