var Entity = require('../entities/entity');

var t = 0;

var getModulationFilter = function(t, mode) {
    var filter = new PIXI.ColorMatrixFilter();

    var R = [1,0,0,0];
    var G = [0,1,0,0];
    var B = [0,0,1,0];
    var A = [0,0,0,1];

    switch(mode) {
    case 0:
        R = [0.5 + (Math.sin(t)*0.5), 0.00, 0.4 + (Math.sin(t*2)*0.4), 0.00];
        G = [0.00, 1.00, 0.00, 0.00];
        B = [0.4 + (Math.cos(t*2)*0.4), 0.5 + (Math.sin(t) * 0.5), 1.00, 0.00];
        A = [0.00, 0.00, 0.00, 0.6 + (Math.sin(t) * 0.4)];
        break;
    case 1:
        R = [0.6 + (Math.sin(t) * 0.4), 0.0, 0.4 + (Math.sin(t*2) * 0.4), 0.2 + (Math.sin(t) * 0.2)];
        G = [0.00, 0.7 + (Math.sin(t*2) * 0.3), 0.00, 0.00];
        B = [0.4 + (Math.cos(t)*0.3), 0.5 + (Math.sin(t) * 0.4), 0.00, 0.00];
        break;
    case 2:
        R = [0.7 + (Math.sin(t) * 0.3), 0, 0, 0];
        G = [0.1, 0.8 + (Math.sin(t*2) * 0.2), 0.1, 0];
        B = [0, 0.1, 0.8 * (Math.sin(t) * 0.2), 0];
        A = [0, 0, 0, 0.9 + (Math.sin(t/2.0) * 0.1)];
        break;
    case 3:
        break;
    }

    filter.matrix = [R[0], R[1], R[2], R[3],
                     G[0], G[1], G[2], G[3],
                     B[0], B[1], B[2], B[3],
                     A[0], A[1], A[2], A[3]];

    return filter;
};

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
    if (app.getState() === 'playing') {
        var board = entities.filter(function(e) {
            return e.type.id === Entity.Types.Board;
        })[0];
        var snap = entities.filter(function(e) {
            return e.type.id === Entity.Types.SnapGUI;
        })[0];
        if (app.game.getState() === 'snapping') {
            if (snap) {
                snap.sprite.filters = [getModulationFilter(t, 1)];
            }
            if (board) {
                board.sprite.filters = [getModulationFilter(t, 0)];
            }
        } else {
            if (board) {
                board.sprite.filters = [getModulationFilter(t, 3)];
            }
            if (snap) {
                snap.sprite.filters = [getModulationFilter(t, 3)];
            }
        }
        var effects = entities.filter(function(e) {
            return e.type.id == Entity.Types.EffectPile;
        });

        effects.forEach(function(effect) {
            effect.sprite.filters = [getModulationFilter(t, 2)];
        });
    }
    if (app.getState() === 'connected') {
        var title = entities.filter(function(e) {
            return e.type.id === Entity.Types.Title;
        })[0];

        if (title) {
            title.sprite.width = title.sprite.width + (Math.sin(t) * 0.1024);
            title.sprite.height = title.sprite.height + (Math.sin(t) * 0.0768);
        }

        var join = entities.filter(function(e) {
            return e.type.id === Entity.Types.Button;
        })[0];

        if (join) {
            join.sprite.filters = [getModulationFilter(t, 0)];
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
