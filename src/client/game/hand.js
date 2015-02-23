var Card = require('./entities/card');
var CardBack = require('./entities/cardback');

function Hand(game, topic, turn, isPlayer, x, y) {
    var cards = [];
    var cardByIndex = {};

    var offset = turn % 2 ? 200 : 50;

    var self = this;

    function position(card, i) {
        card.sprite.position.x = x + (i * 135) - offset;
        card.sprite.position.y = y;
    }

    function reassign(c, i) {
        cardByIndex[c.props.index] = i;
    }
    
    function removed(c) {
        return this.indexOf(c.props.index) === -1;
    }

    function getIndex(d) {
        return d.index;
    }

    function getPropIndex(c) {
        return c.props.index;
    }

    this.update = function(data) {
        data.forEach(self.add);

        var ids = data.map(getIndex);

        cards.filter(removed, ids)
             .map(getPropIndex)
             .forEach(self.remove);
    };

    this.add = function(data) {
        if (cardByIndex[data.index] === undefined) {
            var i = cards.length;
            var card;

            if (isPlayer) {
                card  = Card(x, y, data); 

                position(card, i);
                
                game.transport.addCardTopic(data.index, card.sprite.position.x, card.sprite.position.y, function() {
                    game.renderer.add(card, 10);
                });
            } else {
                card = CardBack(x, y, data);
                
                position(card, i);
                
                var cardTopic = topic + 'hand/' + data.index;

                game.transport.subscribe(cardTopic + '/x', Number, function(x) {
                    card.sprite.position.x = x;
                });

                game.transport.subscribe(cardTopic + '/y', Number, function(y) {
                    card.sprite.position.y = y;
                });

                game.renderer.add(card, 5);
            }
            

            cards.push(card); 
            cards.forEach(reassign);
        }
    };

    this.remove = function(index) {
        if (cardByIndex[index] !== undefined) {
            cards.splice(cardByIndex[index], 1).forEach(game.renderer.remove);
            delete cardByIndex[index];
            
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
