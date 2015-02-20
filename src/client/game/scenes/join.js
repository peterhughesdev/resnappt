var Score = require('../entities/score');

function JoinScene(app, container) {
    var message = Score(1024, 700, 'Joining game');

    var playerSub; 
    var handler; 

    this.enter = function(done) {
        container.add(message);
   
        handler = function(res) {
            switch (res.type) {
                case 'PLAYER' :
                    app.game.playing(res.turn);
                    app.transition('playing');
                    break;
                default :
                    app.transition('spectating');
                    break;
            }
        }    

        playerSub = app.transport.player(null, JSON.parse, handler);
        
        done();

        // Put this here because so we're guaranteed that the scene transition
        // has completed by the time we receive the status response
        app.game.player.ready();
    };

    this.leave = function(done) {
        playerSub.off('update', handler);

        done();
    };
}

module.exports = JoinScene;
