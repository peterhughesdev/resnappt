var Title = require('../entities/title');
var JoinBtn = require('../entities/button.js');
var Board = require('../entities/board');
var Background = require('../entities/background');
var Text = require('../entities/text');

function TitleScene(app, container) {
    var title = Title(1024, 768, '{resnappt}');
    var ready = JoinBtn(1024, 1152);
    var joinText = Text(0, -8, "join");
    var bg = Background();
    var boardDark = Board(1024, 768, 'dark');
    var boardLight = Board(1024, 768, 'light');
    var board = Board(1024, 768, 'base');

    var rune1 = Text(200, 200, '!', 192);
    var rune2 = Text(1848, 200, '"', 192);
    var rune3 = Text(200, 1336, '#', 192);
    var rune4 = Text(1848, 1336, '$', 192);

    this.enter = function(done) {
        container.add(bg);
        container.add(board);
        container.add(boardDark);
        container.add(boardLight);
        container.add(title);
        container.add(rune1);
        container.add(rune2);
        container.add(rune3);
        container.add(rune4);

        var blur = new PIXI.BlurFilter();
        blur.blurX = 6;
        blur.blurY = 6;
        boardLight.sprite.filters = [blur];
        boardLight.sprite.alpha = 0.3;
        boardDark.sprite.alpha = 0.7;
        board.sprite.alpha = 0.7;

        boardLight.sprite.blendMode = PIXI.blendModes.SCREEN;
        boardDark.sprite.blendMode = PIXI.blendModes.MULTIPLY;

        app.transport.establishCommandTopic(function() {
            ready.sprite.addChild(joinText.sprite);
            container.add(ready);
            done();
        });
    }

    this.leave = function(done) {
        var brighten = true;
        var id = setInterval(function() {
            title.sprite.alpha -= 0.01;
            ready.sprite.alpha -= 0.01;

            if (board.sprite.alpha < 1) {
                board.sprite.alpha += 0.002;
            }
            if (boardDark.sprite.alpha > 0) {
                boardDark.sprite.alpha -= 0.025;
            }

            if (boardLight.sprite.alpha > 0.95) {
                brighten = false;
            }

            if (boardLight.sprite.alpha <= 1 && brighten) {
                boardLight.sprite.alpha += 0.025;
            } else if (boardLight.sprite.alpha > 0) {
                boardLight.sprite.alpha -= 0.025;
            }

            if (title.sprite.alpha <= 0) {
                clearInterval(id);
                done();
            }
        }, 1000 / 60);
    }
}

module.exports = TitleScene;
