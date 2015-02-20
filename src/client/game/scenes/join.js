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
                    //app.player = new Player(res.turn);
                    app.transition('playing');
                    break;
                default :
                    app.transition('spectating');
                    break;
            }
        }    

        playerSub = app.transport.player('command', JSON.parse, handler);
        app.game.player.ready();
        
        done();
    };

    this.leave = function(done) {
        playerSub.off('update', handler);

        done();
    };
}

module.exports = JoinScene;
