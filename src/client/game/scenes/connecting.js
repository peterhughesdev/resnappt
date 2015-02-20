var Score = require('../entities/score');

function ConnectingScene(app, container) {
    var connectingText = Score(1024, 700, 'Connecting...');

    this.enter = function(done) {
        container.add(connectingText);
        done();
    };

    this.leave = function(done) {
        done();
    };
}

module.exports = ConnectingScene;
