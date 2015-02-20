var Entity = require('../entities/entity');

function mousedown(e, app, ctx, data) {
    if (app.getState() === 'playing') {
        var entities = app.renderer.getEntitiesForPos(data);

        if (entities.length && !ctx.currentCard) {
            var entity = entities[entities.length - 1];
            var hand = app.game.player.hand;

            // Selecting a hand card
            if (entity.type.id === Entity.Types.Card && hand.has(entity.props.index)) {
                ctx.currentCard = hand.get(entity.props.index);
            }
        }
    }
}

module.exports = {
    events : ['mouse:down'],
    handler : mousedown
};
