var Entity = require('./entities/entity');

var Card = require('./entities/card');
var Score = require('./entities/score');

var coords = require('../util/coords');

var Hand = require('./hand');

function Player(game, transport) {

    var hand = new Hand(game, 700, 400);
    this.hand = hand;

    var score = Score(700, 200, '0');
    var deck = Score(700, 240, 'Dealing');
    var turn = Score(700, 300, 'Waiting to start');
    var effectsPile = [];
    var scoreCard;
    

    var self = this;

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
        transport.dispatch('SNAP', {});
    };

    this.init = function() {
                // Update cards in hand
        transport.player('hand', JSON.parse, function(newHand) {
            newHand.forEach(hand.add);
        });

        // Update score display
        game.render(score);
        transport.player('score', String, score.sprite.setText.bind(score.sprite));

        // Update deck count
        game.render(deck);
        transport.subscribe('deck', String, function(size) {
            deck.sprite.setText('Deck size: ' + size);
        });

        // Handle player turns
        game.render(turn);
        transport.subscribe('turn', String, function(session) {
            self.canPlay = (session === transport.sessionID);

            if (self.canPlay) {
                turn.sprite.setText('Your turn'); 
            } else {
                turn.sprite.setText('Other player\'s turn');
            }
        });

        // Update score pile
        transport.subscribe('pile/score', JSON.parse, function(newScoreCard) {
            if (scoreCard) {
                game.remove(scoreCard);
            }

            scoreCard = createCard(320, 250, newScoreCard);
            game.render(scoreCard);
        });

        // Update effects pile
        transport.subscribe('pile/effects', JSON.parse, function(effects) {
            effectsPile.forEach(game.remove); 

            effects.forEach(function(data, i) {
                var effectCard = createCard(100, 100 + (250 * i), data);
                game.render(effectCard);

                effectsPile.push(effectCard);
            });
        });

    };

    function createCard(x, y, data) {
        return Card(x, y, data.index, data.effect.name, "", data.rune, data.value, data.effect.duration);
    }
}

module.exports = Player;
