var Hand = require('./hand');

function Player(app) { 
    this.hand = new Hand(app, 700, 400);

    this.play = function(card, pile) {
        app.transport.dispatch('PLAY', {
            card : card,
            pile : pile
        }); 
    };

    this.snap = function() {
        app.transport.dispatch('SNAP', {});
    };
}

module.exports = Player;
