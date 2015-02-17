var Entity = require('./entity');

function move(data) {
    if (dragging) {
        var pos = data.getLocalPosition(this.sprite.parent);

        this.sprite.position.x = pos.x
        this.sprite.position.y = pos.y

        onMove(this.sprite.position);
    }
}

var Card = Entity.type('Card', {
    width : 60,
    height : 102,
    texture : '/images/card.jpg'
});

function CardFactory(x, y, rune, score) {
    return Entity.create(Card, {
        x : x,
        y : y,

        data : {
           rune : rune,
           score : score
        }
    });
};

module.exports = CardFactory;
