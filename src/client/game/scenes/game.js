var EffectPile = require('../entities/effect-pile');
var ScorePile = require('../entities/score-pile');
var Text = require('../entities/text');
var Background = require('../entities/background');
var Board = require('../entities/board');
var Card = require('../entities/card');

var effectCardPos = [
    { x : 768, y : 768 },
    { x : 1024, y : 1024 },
    { x : 1280, y : 768 }
];

var scoreCardPos = { x : 1024, y : 768 };

function GameScene(app, container) {
    // Effect card slots
    var effectPiles = [
        EffectPile(effectCardPos[0].x, effectCardPos[0].y),
        EffectPile(effectCardPos[1].x, effectCardPos[1].y),
        EffectPile(effectCardPos[2].x, effectCardPos[2].y)
    ];

    var effectCards = [];

    // Score cards
    var scorePile = ScorePile(scoreCardPos.x, scoreCardPos.y);
    var scoreCard;

    var deck = Text(1024, 240, 'Dealing');
    var turn = Text(1024, 300, 'Waiting to start');

    var bg = Background();
    var board = Board(1024, 768, 'base');
    
    // Subscribe to gameplay topics
    var turnSub;
    var deckSub;
    var snapSub;
    var scorePileSub;
    var effectPileSub;

    app.game.on('playing', function() {
        game.getParticipants().forEach(function(participant, i) {
            container.add(participant.getGUI());
        });
    });

    app.game.on('finished', function() {
        app.transition('finished');
    });

    this.enter = function(done) {
        container.add(bg);
        container.add(board);

        // Setup board
        effectPiles.forEach(container.add);
        container.add(scorePile);

        container.add(deck);
        container.add(turn);

        turnSub = app.transport.subscribe('turn', String).on('update', updateTurn);
        deckSub = app.transport.subscribe('deck', String).on('update', updateDeck);
        snapSub = app.transport.subscribe('snap/timer', Number).on('update', updateSnap);

        scorePileSub = app.transport.subscribe('pile/score', JSON.parse).on('update', updateScorePile);
        effectPileSub = app.transport.subscribe('pile/effects', JSON.parse).on('update', updateEffectPile);
        
        app.game.start();

        done();
    };

    this.leave = function(done) {
        turnSub.off('update', updateTurn);
        deckSub.off('update', updateDeck);
        snapSub.off('update', updateSnap);

        scorePileSub.off('update', updateScorePile);
        effectPileSub.off('update', updateEffectPile);

        done();
    };

    function updateTurn(session) {
        if (session === transport.sessionID) {
            turn.sprite.setText('Your turn'); 
        } else {
            turn.sprite.setText('Other player\'s turn');
        }
    }

    function updateDeck(size) {
        deck.sprite.setText('Deck size: ' + size); 
    }

    function updateSnap(timer) {
        if (app.game.getState() === 'snapping') {
            turn.sprite.setText('Snap! ' + timer);
        }
    }

    function updateScorePile(newScoreCard) {
        if (scoreCard) {
            container.remove(scoreCard);
        }

        scoreCard = Card(scoreCardPos.x, scoreCardPos.y, newScoreCard);
        container.add(scoreCard);
    }

    function updateEffectPile(newEffectCards) {
        effectCards.forEach(container.remove);

        newEffectCards.forEach(function(data, i) {
            var pos = effectCardPos[i];
            var effectCard = Card(pos.x, pos.y, data);
            
            container.add(effectCard);
            effectCards.push(effectCard);
        });
    }
}

module.exports = GameScene;
