var Entity = require('./entity');
var Text = require('./text');

var Card = Entity.type('Card', {
    width : 200,
    height : 300,
    texture : '/images/card.jpg'
});

function CardFactory(x, y, data) {
    var rune = '';
    switch (data.rune) {
    case 'a':
        rune = '!';
        break;
    case 'b':
        rune = '"';
        break;
    case 'c':
        rune = '#';
        break;
    case 'd':
        rune = '$';
        break;
    };


    var rune = Text(55, 32, rune, 60, 'black');
    var duration = Text(70, 115, data.effect.duration, 48, 'black');
    var score = Text(72, -125, data.value, 48, 'black');
    var name = Text(-20, -122, data.effect.name, 32, 'black');

    name.sprite.width = 230;

    var texture = '/images/cards/' + data.effect.name.toLowerCase() + '.png';

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
