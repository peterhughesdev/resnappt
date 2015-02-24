var Entity = require('../entities/entity');

function mousedown(e, app, ctx, data) {
    if (ctx.currentCard === undefined && app.getState() === 'playing') {
        var entities = app.renderer.getEntitiesForPos(data);

        if (entities.length) {
            var hand = app.game.player.hand;

            // Selecting a hand card - traverse backwards through the entities until we find a card
            for (var i = entities.length - 1; i >= 0; --i) {
                var entity = entities[i];           

                if (entity.type.id === Entity.Types.Card && hand.has(entity.props.index)) {
                    ctx.currentCard = hand.get(entity.props.index);
                    break;
                }
            }

            if (ctx.currentCard) {
                hand.get().forEach(function(card) {
                    app.renderer.remove(card);

                    if (card === ctx.currentCard) {
                        app.renderer.add(card, 11);
                    } else {
                        app.renderer.add(card, 10);
                    }
                });
            }
        }
    }
}

module.exports = {
    events : ['mouse:down'],
    handler : mousedown
};
