var Score = require('../entities/score');

function ErrorScene(app, container) {
    var message = Score(1024, 700, 'Error :(');

    this.enter = function(done) {
        container.add(message);
        done();
    };

    this.leave = function(done) {
        done();
    };
}

module.exports = ErrorScene;
