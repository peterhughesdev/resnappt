var Entity = require('../entities/entity');

var t = 0;

function animate(app, ctx, dt) {
    var entities = app.renderer.getEntities();

    //entities.filter(function(e) { 
    //    return e.type.id === Entity.Types.Card;
    //}).forEach(function(card) {
    //    if (card.props.fading) {
    //        card.sprite.alpha++;
    //    }

    //    if (card.sprite.alpha >= 1) {
    //        card.props.fading = false;
    //    }
    //});

    if (app.getState() === 'connected') {
        var title = entities.filter(function(e) {
            return e.type.id === Entity.Types.Title;
        })[0];

        if (title) {
            title.sprite.width = title.sprite.width + (Math.sin(t) * 0.1024);
            title.sprite.height = title.sprite.height + (Math.sin(t) * 0.0768);
        }

        var runes = entities.filter(function(e) {
            return e.type.id === Entity.Types.Text;
        });

        for (var r in runes) {
            var rune = runes[r];
            rune.sprite.width = rune.sprite.width + (Math.sin(t / 3.0) * 0.2048);
            rune.sprite.height = rune.sprite.height + (Math.sin(t / 3.0) * 0.1536);
            rune.sprite.alpha = 0.5 + (Math.cos(t / 7.0) * 0.5);
        }

        var boards = entities.filter(function(e) {
            return e.type.id === Entity.Types.Board;
        });

        for (var b in boards) {
            var board = boards[b];
            switch (board.props.name) {
            case 'dark':
                board.sprite.alpha = 0.6 + (Math.sin(t*2) * 0.4);
                break;
            case 'light':
                board.sprite.alpha = 0.4 + (Math.cos(t) * 0.3);
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
