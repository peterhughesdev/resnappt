var Transport = require('./data/transport');
var Player = require('./game/player');

function Game() {
    var transport = new Transport();
    var player;

    transport.on('active', function() {
        player = new Player(transport);
    });

    transport.init();
}

module.exports = Game;
