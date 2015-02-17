var EventEmitter = require('events').EventEmitter;
var Transport = require('./data/transport');
var Renderer = require('./game/renderer');
var Player = require('./game/player');
var Board = require('./game/gui/board');

var coords = require('./util/coords');

var log = console.log.bind(console);

function Game(app) {
    EventEmitter.call(this);

    var services = [];

    var renderer = new Renderer(this, coords.width, coords.height);
    var board = new Board(this, renderer);
    
    var transport = new Transport();
    var player;

    var self = this;

    transport.on('active', function() {
        player = new Player(self, transport);
    });

    this.render = function(entity) {
        renderer.add(entity);
    };

    this.tick = function(entity) {
        services.forEach(function(service) {
            if (service.handles(entity.type.id)) {
                service.process(entity);
            }
        });
    };

    transport.init();
    renderer.init();
}

Game.prototype = new EventEmitter();

module.exports = Game;
