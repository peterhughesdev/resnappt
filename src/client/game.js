var Transport = require('./data/transport');
var Renderer = require('./game/renderer');
var Player = require('./game/player');

var Card = require('./game/card');

var log = console.log.bind(console);

function Game(app) {
    var renderer = new Renderer(this, document.body.clientWidth, document.body.clientHeight);
    var transport = new Transport();
    
    var player;

    transport.on('active', function() {
        player = new Player(transport);

        var card = new Card(10, 10, log);
        renderer.add(card);

    });

    transport.init();
    renderer.init();
}

module.exports = Game;
