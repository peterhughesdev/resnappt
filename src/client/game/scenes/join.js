var Text = require('../entities/text');
var Background = require('../entities/background');
var Board = require('../entities/board');

function JoinScene(app, container) {
    var message = Text(1024, 700, 'Joining game');

    var playerSub;
    var playerReady;
    var playerLeft;

    var bg = Background();
    var board = Board(1024, 768, 'base');

    var stateHandle;
    var playerLeft;

    this.enter = function(done) {
        container.add(bg);
        container.add(board);
        container.add(message);

        stateHandle = function(res, topic) {
            console.log(res);
            if (res.state === 'PLAYING') {
                res.players.forEach(function(p) {
                    app.game.addParticipant(p.playerID, p.turn, p.playerID === app.transport.sessionID);
                });

                app.transition('playing');
            }
        }

        playerLeft = function(reason, topic) {
            var session = topic.split('/')[1];
            app.game.remove()
        }

        playerSub = app.transport.subscribe('state', JSON.parse, stateHandle);
        done();

        // Put this here so we're guaranteed that the scene transition
        // has completed by the time we receive the status response
        app.transport.dispatch('READY', {
                sessionID : app.transport.sessionID
        });
    };

    this.leave = function(done) {
        playerSub.off('update', stateHandle);
        done();
    };
}

module.exports = JoinScene;
