var Score = require('../entities/score');

function JoinScene(app, container) {
    var message = Score(1024, 700, 'Joining game');

    var playerSub;

    var playerReady;
    var playerLeft;

    this.enter = function(done) {
        container.add(message);
   
        playerReady = function(res, topic) {
            var session = topic.split('/')[1];

            if (session === app.transport.sessionID) {
                switch (res.type) {
                    case 'PLAYER' :
                        app.game.addParticipant(session, res.turn, true);
                        app.transition('playing');
                        break;
                    default :
                        app.transition('spectating');
                        break;
                }
            } else if (res.type === 'PLAYER') {
                app.game.addParticipant(session, res.turn); 
            }
        }    

        playerLeft = function(reason, topic) {
            var session = topic.split('/')[1];
            app.game.remove()
        }

        playerSub = app.transport.subscribe('?sessions/.*', JSON.parse, playerReady);
        playerSub.on('unsubscribed', playerLeft);
        done();

        // Put this here so we're guaranteed that the scene transition
        // has completed by the time we receive the status response
        app.transport.dispatch('READY', {
                sessionID : app.transport.sessionID
        });
    };

    this.leave = function(done) {
        playerSub.off('update', playerReady);
        playerSub.off('unsubscribed', playerLeft);
        done();
    };
}

module.exports = JoinScene;
