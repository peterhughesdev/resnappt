var Text = require('../entities/text');

function ConnectingScene(app, container) {
    var connectingText = Text(1024, 700, 'Connecting...', 64, 'white');

    this.enter = function(done) {
        container.add(connectingText);
        done();
    };

    this.leave = function(done) {
        done();
    };
}

module.exports = ConnectingScene;
