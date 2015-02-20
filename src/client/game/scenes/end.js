function EndScene(app, container) {
    this.enter = function(done) {
        done();
    };

    this.leave = function(done) {
        done();
    };
}

module.exports = EndScene;
