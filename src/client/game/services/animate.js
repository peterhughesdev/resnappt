var Entity = require('../entities/entity');

var t = 0;

function animate(app, ctx, dt) {
    var entities = app.renderer.getEntities();

    if (app.getState() === 'connected') {
        var title = entities.filter(function(e) {
            return e.type.id === Entity.Types.Title;
        })[0];

        if (title) {
            title.sprite.width = title.sprite.width + (Math.sin(t) * 0.1024);
            title.sprite.height = title.sprite.height + (Math.sin(t) * 0.0768);
        }

        var boards = entities.filter(function(e) {
            return e.type.id === Entity.Types.Board;
        });

        for (var b in boards) {
            var board = boards[b];
            switch (board.props.name) {
            case 'dark':
                board.sprite.alpha = 0.7 + (Math.sin(t*2) * 0.3);
                break;
            case 'light':
                board.sprite.alpha = 0.1 + (Math.cos(t*2) * 0.2);
                break;
            case 'base':
                board.sprite.alpha = 0.7 + (Math.sin(t*2) * 0.3);
                break;
            }
        }
    }

    t = t + 0.02;
}

module.exports = {
    handler : animate
};
