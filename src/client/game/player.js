var PlayerGUI = require('./entities/player-gui');
var Text = require('./entities/text');

var Hand = require('./hand');

// Player GUIs
var playerPosition = [
    { x : 200, y : 200 },
    { x : 1800, y : 200 },
    { x : 200, y : 1200 },
    { x : 1800, y : 1200 }
];

function Player(app, session, turn) { 
    var pos = playerPosition[turn];

    var score = Text(0, 80, '0');
    var name = Text(0, 80, 'Player ' + turn);
    var icon = Text(200, 0, 'Playing');

    var gui = PlayerGUI(pos.x, pos.y, name, score, icon);

    var hand = new Hand(app, pos.x, pos.y);

    var topic = 'sessions/' + session + '/';
    var active = false;

    this.hand = hand;

    app.transport.subscribe(topic + 'score', String, function(t) {
        score.sprite.setText(t);    
    });

    app.transport.subscribe(topic + 'hand', JSON.parse, function(newHand) {
        newHand.forEach(hand.add);
    });

    this.play = function(card, pile) {
        app.transport.dispatch('PLAY', {
            card : card,
            pile : pile
        }); 
    };

    this.snap = function() {
        app.transport.dispatch('SNAP', {});
    };

    this.remove = function() {
     
    };

    this.setActive = function() {
        icon.sprite.alpha = 1;
        active = true;
    };

    this.setInactive = function() {
        icon.sprite.alpha = 0;
        active = false;
    };

    this.isActive = function() {
        return active;
    };

    this.getGUI = function() {
        return gui;
    };
}

module.exports = Player;
