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


    var rune = Text(100, 75, rune, 120, 'black');
    var duration = Text(140, 230, data.effect.duration, 96, 'black');
    var score = Text(140, -250, data.value, 96, 'black');
    var name = Text(-40, -245, data.effect.name, 64, 'black');

    name.sprite.width = 240;

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
