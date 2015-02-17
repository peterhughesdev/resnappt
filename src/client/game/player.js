var Card = require('./entities/card');

function Player(game, transport) {
    
    var hand = [];

    game.on('mouse:up', function(d) {
        console.log(d);
    });

    this.play = function(card, pile) {
        transport.dispatch('PLAY', {
            card : card,
            pile : pile
        }); 
    };

    this.ready = function() {
        transport.dispatch('READY');
    };

    this.snap = function() {
        transport.dispatch('SNAP');
    };

    function handUpdate(newHand) {
        for (var i = hand.length - 1; i < newHand.length; ++i) {
            var card = Card(550 + (i * 65), 700);
            game.render(card);

            hand.push(card);
        }
    };

    transport.subscribe('hand').transform(JSON.parse).on('update', handUpdate);
}

module.exports = Player;
