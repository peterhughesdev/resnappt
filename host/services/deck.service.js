var deck = [];

var effects = [{name:'a'},{name:'b'},{name:'c'}];
var scores = [1,2,3,4];
var runes = [1,2,3,4];

var generateCard = function() {
    var effect = effects[parseInt(Math.random() * effects.length, 10)];
    var score = scores[parseInt(Math.random() * effects.length, 10)];
    var rune = runes[parseInt(Math.random() * effects.length, 10)];

    console.log('Effect = '+effect.name);
    console.log('Score = '+score);
    console.log('Rune = '+rune);

    return {effect : effect, score : score, rune : rune};
};

exports.generateDeck = function(deckSize) {
    for (var i=0; i<deckSize; i++) {
        deck[deck.length] = generateCard();
    }
};

exports.drawCard = function() {
    return deck.pop();
};
