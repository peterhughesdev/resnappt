var Entity = require('./entities/entity');

var Card = require('./entities/card');
var Score = require('./entities/score');

var coords = require('../util/coords');

function Player(game, transport) {
    var score = Score(700, 200, '0');
    var hand = [];

    var canPlay = false;
    var currentCard = null;

    game.on('mouse:up', function(d) {
        if (canPlay) {
            var pos = d.getLocalPosition();
            var entity = this.renderer.getEntityForPos(pos.x, pos.y);
            
            if (entity) {
                if (entity.type.id === Entity.Types.Card) {
                    currentCard = entity; 
                }

                if (entity.type.id === Entity.Types.EffectPile && currentCard) {
                    
                }

                if (entity.type.id === Entity.Types.ScorePile && currentCard) {
                    
                }
            }
        }
    });

    this.play = function(card, pile) {
        transport.dispatch('PLAY', {
            card : card,
            pile : pile
        }); 
    };

    this.ready = function() {
        transport.dispatch('READY', {
            sessionID : transport.sessionID
        });
    };

    this.snap = function() {
        transport.dispatch('SNAP');
    };

    function handUpdate(newHand) {
        var i = Math.max(hand.length - 1, 0); 

        for (; i < newHand.length; ++i) {
            var card = Card(550 + (i * 65), 700, newHand[i].rune, newHand[i].score);
            
            hand.push(card);
            game.render(card);
        }
    };

    function scoreUpdate(newScore) {
        score.sprite.setText(newScore);
    };

    transport.player('hand', JSON.parse, handUpdate);
    transport.player('score', String, scoreUpdate);

    game.render(score);


    var deck = Score(700, 340, 'Dealing');

    transport.subscribe('deck', String, function(size) {
        deck.sprite.setText('Deck size: ' + size);
    });

    game.render(deck);

    transport.subscribe('turn', String, function(session) {
        console.log('Turn for', session);
        canPlay = (session === transport.sessionID);
    });

    setTimeout(function() {
        transport.dispatch('READY', {
                sessionID : transport.sessionID
        });
    }, 3000);
}

module.exports = Player;
