var Entity = require('../entities/entity');

function mousemove(e, app, ctx, data) {
    var pos = app.renderer.getLocalPosition(data);

    if (app.getState() === 'playing') {
        var currentCard = ctx.currentCard;
        var highlighted = ctx.highlighted;

        if (currentCard) {
            currentCard.sprite.position.x = pos.x;
            currentCard.sprite.position.y = pos.y;

            app.transport.updateCardTopic(currentCard.props.index, pos.x, pos.y);            
        } else {
            var entities = app.renderer.getEntitiesForPos(data);
            var player = app.game.player;

            if (entities.length && app.game.getState() === 'playing' && player && player.isActive()) {
                for (var i = entities.length - 1; i >= 0; --i) {
                    var entity = entities[i];

                    if (entity.type.id === Entity.Types.Card && player.hand.has(entity.props.index)) {
                        if (highlighted) {
                            highlighted.sprite.tint = 0xFFFFFF;
                        }

                        highlighted = entity;
                        break;
                    }
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
