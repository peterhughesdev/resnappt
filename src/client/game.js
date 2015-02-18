var EventEmitter = require('events').EventEmitter;
var Transport = require('./data/transport');
var Renderer = require('./game/renderer');
var Player = require('./game/player');
var Board = require('./game/gui/board'); 

var Entity = require('./game/entities/entity');
var Button = require('./game/entities/button');

var coords = require('./util/coords');

var log = console.log.bind(console);

function Game(app) {
    EventEmitter.call(this);

    var services = [];

    var transport = new Transport();
    this.transport = transport;

    var renderer = new Renderer(this, coords.width, coords.height);
    
    var self = this;
    
    var board;
    var player;

    var joinBtn = Button(coords.width / 2, coords.height / 2);

    transport.on('active', function() {
        self.render(joinBtn);

        board = new Board(self);
        player = new Player(self, transport);
    });

    this.render = function(entity) {
        renderer.add(entity);
    };

    this.remove = function(entity) {
        renderer.remove(entity);
    };

    this.tick = function(entity) {
        services.forEach(function(service) {
            if (service.handles(entity.type.id)) {
                service.process(entity);
            }
        });
    };

    var currentCard = undefined;

    this.on('mouse:up', function(d) {
        var pos = d.global;
        var entities = renderer.getEntitiesForPos(pos.x, pos.y);

        if (entities.length) {
            var entity = entities[entities.length - 1];
            var bottom = entities[0];

            if (player.canPlay) {
                // Selecting a hand card
                if (entity.type.id === Entity.Types.Card && player.hand.has(entity.props.id)) {
                    if (currentCard) {
                        currentCard.sprite.tint = 0xFFFFFF;
                    }

                    currentCard = player.hand.get(entity.props.id);
                    currentCard.sprite.tint = 0xFFFF00;
                }

                // Adding a card to the score pile
                if (bottom.type.id === Entity.Types.ScorePile && currentCard !== undefined) {
                    player.play(currentCard.props.id, 'SCORE')

                    currentCard.sprite.x = bottom.sprite.x;
                    currentCard.sprite.y = bottom.sprite.y;
                    currentCard.sprite.tint = 0xFFFFFF;

                    player.hand.remove(currentCard.props.id);

                    currentCard = undefined;   
                }

                // Adding a card to the effect pile
                if (bottom.type.id === Entity.Types.EffectPile && currentCard !== undefined && player.hand.size() > 1) {
                    player.play(currentCard.props.id, 'EFFECT');

                    currentCard.sprite.x = bottom.sprite.x;
                    currentCard.sprite.y = bottom.sprite.y;
                    currentCard.sprite.tint = 0xFFFFFF;
                    
                    player.hand.remove(currentCard.props.id);
                    
                    currentCard = undefined;
                }
            } else {
                // Join the game
                if (bottom === joinBtn) {
                    self.remove(joinBtn);
                    player.init();
                    player.ready();
                }    

                // Snap the score pile 
                if (bottom.type.id === Entity.Types.ScorePile) {
                    player.snap();
                }
            }
        }
    });

    transport.init();
    renderer.init();
}

Game.prototype = new EventEmitter();

module.exports = Game;
