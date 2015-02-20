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


function CardFactory(x, y, data) {
    var rune = Entity.createText(Rune, {
        x : 80,
        y : 90,
        text : data.rune
    });

    var duration = Entity.createText(Rune, {
        x : 110,
        y : 240,
        text : data.effect.duration
    });

    var score = Entity.createText(Rune, {
        x : 110,
        y : -240,
        text : data.value
    });

    var name = Entity.createText(Name, {
        x : -40,
        y : -240,
        text : data.name 
    });

    var desc = Entity.createText(Desc, {
        x : -20,
        y : 180,
        text : "" 
    });

    var texture = '/images/cards/' + data.name.toLowerCase() + '.png';

    var card = Entity.create(Card, {
        x : x,
        y : y,
        index : data.index,
        rune : data.rune,
        score : data.score,
        texture : texture
    });

    card.sprite.addChild(duration.sprite);
    card.sprite.addChild(name.sprite);
    card.sprite.addChild(rune.sprite);
    card.sprite.addChild(score.sprite);

    return card;
};

module.exports = CardFactory;
