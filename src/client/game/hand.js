var Card = require('./entities/card');

function Hand(game, topic, isPlayer, x, y) {
    var cards = [];
    var cardByIndex = {};

    function create(data) {
        var card = Card(x, y, data);
       
        if (isPlayer) {
            game.transport.addCardTopic(data.index, function() {
                game.renderer.add(card);
                cards.push(card); 
            });
        } else {
            game.transport.subscribe(topic + '/' + data.index + '/x', Number, function(x) {
                card.sprite.position.x = x;
            });

            game.transport.subscribe(topic + '/' + data.index + '/y', Number, function(y) {
                card.sprite.position.y = y;
            });
        }
    }

    function reposition(card, i) {
        card.sprite.position.x = x + (i * 135);
        card.sprite.position.y = y;
    }

    function reassign(card, i) {
        cardByIndex[card.props.index] = i;
    }

    this.add = function(data) {
        if (cardByIndex[data.index] === undefined) {
            create(data);
            
            cards.forEach(reposition);
            cards.forEach(reassign);
        }
    };

    this.remove = function(index) {
        if (cardByIndex[index] !== undefined) {
            cards.splice(cardByIndex[index], 1).forEach(game.remove);
            delete cardByIndex[index];
            
            cards.forEach(reposition);
            cards.forEach(reassign);
        }
    };

    this.get = function(index) {
        if (index) {
            return cards[cardByIndex[index]];
        } else {
            return cards;
        }
    };

    this.has = function(index) {
        return cardByIndex[index] !== undefined;
    };

    this.size = function() {
        return cards.length;
    };
}

module.exports = Hand;
