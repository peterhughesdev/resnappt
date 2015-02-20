var Entity = require('../entities/entity');

var t = 0;

function animate(app, ctx, dt) {
    var entities = app.renderer.getEntities();

    if (app.getState() === 'connected') {
        var title = entities.filter(function(e) {
            return e.type.id === Entity.Types.Score;
        })[0];

        if (title) {
            title.sprite.y = title.sprite.y + (Math.sin(t) * 0.2);
            t += 0.02;
        }
    }
}

module.exports = {
    handler : animate
};
