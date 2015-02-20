var Score = require('../entities/score');
var JoinBtn = require('../entities/button.js');

function TitleScene(app, container) {
    var title = Score(1024, 700, 'Resnappt!');
    var ready = JoinBtn(1024, 930);

    this.enter = function(done) {
        container.add(title);

        app.transport.establishCommandTopic(function() {
            container.add(ready);
            done();
        }); 
    }
    
    this.leave = function(done) {
        var id = setInterval(function() {
            title.sprite.alpha -= 0.1;
            ready.sprite.alpha -= 0.1;

            if (title.sprite.alpha <= 0) {
                clearInterval(id);
                done();
            }
        }, 1000 / 60);
    }
}

module.exports = TitleScene;
