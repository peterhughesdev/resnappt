var Text = require('../entities/text');

function ErrorScene(app, container) {
    var message = Text(1024, 700, 'Error :(', 64, 'red');

    this.enter = function(done) {
        container.add(message);
        done();
    };

    this.leave = function(done) {
        done();
    };
}

module.exports = ErrorScene;
