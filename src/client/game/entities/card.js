var Entity = require('./entity');

var Rune = Entity.type('Rune', {
    style : { 
        font : "bold 100px Arial",
        fill : "blue"
    }
});

var Card = Entity.type('Card', {
    width : 100,
    height : 160,
    texture : '/images/card.jpg'
});

function CardFactory(x, y, id, rune, score) {
    var r = Entity.createText(Rune, {
        x : -100,
        y : -270,
        text : rune
    });

    var s = Entity.createText(Rune, {
        x : 100,
        y : 270,
        text : score
    });

    var card = Entity.create(Card, {
        x : x,
        y : y,
        id : id,
        rune : rune,
        score : score
    });

    card.sprite.addChild(r.sprite);
    card.sprite.addChild(s.sprite);

    return card;
};

module.exports = CardFactory;
