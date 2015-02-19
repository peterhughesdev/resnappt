var Entity = require('./entity');

var Rune = Entity.type('Rune', {
    style : { 
        font : "bold 100px Arial",
        fill : "blue"
    }
});

var Name = Entity.type('Name', {
    style : {
        font : "bold 50px Arial",
        fill : "blue"
    }
});

var Desc = Entity.type('Desc', {
    width : 140,
    style : {
        font : "30px Arial",
        fill : "black"
    }
});

var Card = Entity.type('Card', {
    width : 100,
    height : 160,
    texture : '/images/card.jpg'
});


function CardFactory(x, y, index, name, desc, rune, score, duration) {
    var r = Entity.createText(Rune, {
        x : 80,
        y : 90,
        text : rune
    });

    var d = Entity.createText(Rune, {
        x : 110,
        y : 240,
        text : duration
    });

    var s = Entity.createText(Rune, {
        x : 110,
        y : -240,
        text : score
    });

    var n = Entity.createText(Name, {
        x : -40,
        y : -240,
        text : name 
    });

    var de = Entity.createText(Desc, {
        x : -20,
        y : 180,
        text : desc
    });

    var texture = '/images/cards/' + name.toLowerCase() + '.png';

    var card = Entity.create(Card, {
        x : x,
        y : y,
        index : index,
        rune : rune,
        score : score,
        texture : texture
    });

    card.sprite.addChild(d.sprite);
    card.sprite.addChild(n.sprite);
    card.sprite.addChild(r.sprite);
    card.sprite.addChild(s.sprite);

    return card;
};

module.exports = CardFactory;
