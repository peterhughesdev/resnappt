var Entity = require('../entities/entity');

function mouseup(e, app, ctx, data) {
    var entities = app.renderer.getEntitiesForPos(data);

    if (entities.length) {
        var entity = entities[entities.length - 1];
        var bottom = entities[0];

        if (app.getState() === 'playing') {
            var currentCard = ctx.currentCard;
            var player = app.game.player;

            for (var i = 0; i < entities.length; ++i) {

            var bottom = entities[i];

            // Adding a card to the score pile
            if (bottom.type.id === Entity.Types.ScorePile && currentCard !== undefined) {
                player.play(currentCard.props.index, 'SCORE')

                currentCard.sprite.x = bottom.sprite.x;
                currentCard.sprite.y = bottom.sprite.y;
                currentCard.sprite.tint = 0xFFFFFF;

                player.hand.remove(currentCard.props.index);
                break;
            }

            // Adding a card to the effect pile
            if (bottom.type.id === Entity.Types.EffectPile && currentCard !== undefined && player.hand.size() > 1) {
                player.play(currentCard.props.index, 'EFFECT');

                currentCard.sprite.x = bottom.sprite.x;
                currentCard.sprite.y = bottom.sprite.y;
                currentCard.sprite.tint = 0xFFFFFF;

                player.hand.remove(currentCard.props.index);
                break;
            }

            // Snap the score pile 
            if (bottom.type.id === Entity.Types.ScorePile) {
                player.snap();
                break;
            }

            }
        }

        if (app.getState() === 'connected') {
            // Join the game
            if (entity.type.id  === Entity.Types.Button) {
                app.transition('joining');
            }    
       }

       ctx.currentCard = undefined;
    }
}

module.exports = {
    events : ['mouse:up'],
    handler : mouseup
};
