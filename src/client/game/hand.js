var Card = require('./entities/card');

function Hand(game, topic, isPlayer, x, y) {
    var cards = [];
    var cardByIndex = {};

    function reposition(card, i) {
        card.sprite.position.x = x + (i * 135);
        card.sprite.position.y = y;
    }

    function reassign(card, i) {
        cardByIndex[card.props.index] = i;
    }

    this.add = function(data) {
        if (cardByIndex[data.index] === undefined) {
            var card = Card(x, y, data); 
            
            cards.push(card); 
            cards.forEach(reposition);
            cards.forEach(reassign);

            if (isPlayer) {
                game.transport.addCardTopic(data.index, card.sprite.position.x, card.sprite.position.y, function() {
                    game.renderer.add(card);
                });
            } else {
                var cardTopic = topic + 'hand/' + data.index;

                game.transport.subscribe(cardTopic + '/x', Number, function(x) {
                    card.sprite.position.x = x;
                });

                game.transport.subscribe(cardTopic + '/y', Number, function(y) {
                    card.sprite.position.y = y;
                });

                game.renderer.add(card);
            }
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
