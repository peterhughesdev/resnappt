var EffectPile = require('../entities/effect-pile');
var ScorePile = require('../entities/score-pile');
var Text = require('../entities/text');
var Background = require('../entities/background');
var Board = require('../entities/board');
var Card = require('../entities/card');
var SnapGUI = require('../entities/snap-ui');

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

    var bg = Background();
    var board = Board(1024, 768, 'base');
    var snap = SnapGUI(1024, 384);
    var deck = Text(1024, 128, 'Dealing...', 48);
    
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
        container.add(snap, 8);
        container.add(deck);

        // Setup board
        effectPiles.forEach(container.add);
        container.add(scorePile);

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
        deckSub.off('update', updateDeck);
        snapSub.off('update', updateSnap);

        scorePileSub.off('update', updateScorePile);
        effectPileSub.off('update', updateEffectPile);

        stateSub.off('update', endGame);

        app.renderer.getEntities().filter(function(e) {
            return e.type.id === Entity.Types.Card || e.type.id === Entity.Types.CardBack;
        }).forEach(app.renderer.remove);

        done();
    };

    function endGame(res) {
        if (res.state === 'FINISHED') {
            app.game.end();
            app.transition('finished');
        }
    }

    function updateDeck(size) {
        deck.sprite.setText('Deck size : '+size);
    }

    function updateTurn() {
        snap.text.sprite.setText('');
    }

    function updateSnap(timer) {
        if (app.game.getState() === 'snapping') {
            snap.text.sprite.setText(timer);
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
