var EffectPile = require('../entities/effect-pile');
var ScorePile = require('../entities/score-pile');
var Text = require('../entities/text');
var Background = require('../entities/background');
var Board = require('../entities/board');
var Card = require('../entities/card');

var effectCardPos = [
    { x : 640, y : 768 },
    { x : 1024, y : 1152 },
    { x : 1408, y : 768 }
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

    var deck = Text(1024, 140, 'Dealing', 48);
    var turn = Text(1024, 200, 'Waiting to start', 48);

    var bg = Background();
    var board = Board(1024, 768, 'base');
    
    // Subscribe to gameplay topics
    var stateSub;
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

        container.add(deck, 20);
        container.add(turn, 20);

        turnSub = app.transport.subscribe('turn', String).on('update', updateTurn);
        deckSub = app.transport.subscribe('deck', String).on('update', updateDeck);
        snapSub = app.transport.subscribe('snap/timer', Number).on('update', updateSnap);

        scorePileSub = app.transport.subscribe('pile/score', JSON.parse).on('update', updateScorePile);
        effectPileSub = app.transport.subscribe('pile/effects', JSON.parse).on('update', updateEffectPile);

        stateSub = app.transport.subscribe('state', JSON.parse).on('update', endGame);

        app.game.start();

        done();
    };

    this.leave = function(done) {
        turnSub.off('update', updateTurn);
        deckSub.off('update', updateDeck);
        snapSub.off('update', updateSnap);

        scorePileSub.off('update', updateScorePile);
        effectPileSub.off('update', updateEffectPile);

        stateSub.off('update', endGame);

        done();
    };

    function endGame(res) {
        if (res.state === 'NOT_PLAYING') {
            app.game.end();
            app.transition('finished');
        }   
    }

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
            turn.sprite.setText('Snap : ' + timer);
        }
    }

    function updateScorePile(newScoreCard) {
        if (scoreCard) {
            container.remove(scoreCard);
        }

        scoreCard = Card(scoreCardPos.x, scoreCardPos.y, newScoreCard);
        container.add(scoreCard, 7);
    }

    function updateEffectPile(newEffectCards) {
        effectCards.forEach(container.remove);

        effectPiles.forEach(function(e, i) {
            if (i > newEffectCards.length) {
                effectPiles[i].sprite.alpha = 0;
            } else {
                effectPiles[i].sprite.alpha = 1;
            }
        });

        newEffectCards.forEach(function(data, i) {
            var pos = effectCardPos[i];
            var effectCard = Card(pos.x, pos.y, data);
            
            container.add(effectCard, 7);
            effectCards.push(effectCard);
        });
    }
}

module.exports = GameScene;
