var types = require('./types');
var runes = require('./runes');
var balance = require('../math/balance');

var Card = require('./card');

function Deck() {
    var cards = [];

    var self = this;

    var generateCard = function() {
        var type = types.random();
        var value = balance.generateScoreValue();
        var rune = runes.random();

        var card = new Card(rune, value, type);

        cards[cards.length] = card;
    };

    this.generateDeck = function(size, callback) {
        cards = [];
        for (var i=0; i<size; i++) {
            generateCard();
        }
        callback(self);
    };

    this.drawCard = function() {
        return cards.pop();
    };

    this.remaining = function() {
        return cards.length;
    };
};

module.exports = Deck;
