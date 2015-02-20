var Entity = require('../entities/entity');

function mousemove(e, app, ctx, data) {
    var pos = app.renderer.getLocalPosition(data);

    if (app.getState() === 'playing') {
        var currentCard = ctx.currentCard;
        var highlighted = ctx.highlighted;

        if (currentCard) {
            currentCard.sprite.position.x = pos.x;
            currentCard.sprite.position.y = pos.y;

            // TODO: Update card topic
        } else {
            var entities = app.renderer.getEntitiesForPos(data);
            var game = app.game;

            if (entities.length && game.getState() === 'playing') {
                var entity = entities[entities.length - 1];

                if (entity.type.id === Entity.Types.Card && game.player.hand.has(entity.props.index)) {
                    if (highlighted) {
                        highlighted.sprite.tint = 0xFFFFFF;
                    }

                    highlighted = entities[entities.length - 1]; 
                }

                if (highlighted) {
                    highlighted.sprite.tint = 0xFFFF00;
                }
            } else {
                if (highlighted) {
                    highlighted.sprite.tint = 0xFFFFFF; 
                    highlighted = undefined;
                }
            }

            ctx.highlighted = highlighted;
        }
    }
}

module.exports = {
    events : ['mouse:move'],
    handler : mousemove
};
