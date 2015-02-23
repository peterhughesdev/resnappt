var PlayerGUI = require('./entities/player-gui');
var Text = require('./entities/text');

var Hand = require('./hand');

// Player GUIs
var playerPosition = [
    { x : 200, y : 200 },
    { x : 1848, y : 200 },
    { x : 200, y : 1336 },
    { x : 1848, y : 1336 }
];

function Player(app, session, turn, isPlayer) { 
    var pos = playerPosition[turn];

    var yOffset = turn < 2 ? 0 : 315;
    var xOffset = turn % 2 ? 96 : 0;

    var score = Text(-60 - xOffset, 170 - yOffset, 'Score : 0', 28);
    var name = Text(-60 - xOffset, 145 - yOffset, 'Player ' + turn, 28);
    var icon = Text(60 - xOffset, 145 - yOffset, 'Playing', 28);

    var gui = PlayerGUI(pos.x, pos.y, name, score, icon);

    var topic = 'sessions/' + session + '/';
    var active = false;
    icon.sprite.alpha = 0;

    var hand = new Hand(app, topic, turn, isPlayer, pos.x, pos.y);
    this.hand = hand;

    app.transport.subscribe(topic + 'score', String, function(score) {
        score.sprite.setText('Score : '+score);
    });
    app.transport.subscribe(topic + 'hand', JSON.parse, hand.update);

    this.play = function(card, pile) {
        hand.remove(card);
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

        console.log('Player (' + isPlayer + ') ' + session + ' is active');
    };

    this.setInactive = function() {
        icon.sprite.alpha = 0;
        active = false;
        
        console.log('Player (' + isPlayer + ') ' + session + ' is inactive');
    };

    this.isActive = function() {
        return active;
    };

    this.getGUI = function() {
        return gui;
    };
}

module.exports = Player;
