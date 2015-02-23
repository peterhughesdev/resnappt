var Entity = require('../entities/entity');

function mouseup(e, app, ctx, data) {
    var entities = app.renderer.getEntitiesForPos(data);

    if (entities.length) {
        var appState = app.getState();

        if (appState === 'playing') {
            var currentCard = ctx.currentCard;
            var gameState = app.game.getState();
            var player = app.game.player;

            if (currentCard && player.isActive()) {
                for (var i = 0; i < entities.length; ++i) {
                    var bottom = entities[i];

                    // Adding a card to the score pile
                    if (bottom.type.id === Entity.Types.ScorePile) {
                        player.play(currentCard.props.index, 'SCORE')
                        app.game.endRound();
                        break;
                    }

                    // Adding a card to the effect pile
                    if (bottom.type.id === Entity.Types.EffectPile && player.hand.size() > 1) {
                        player.play(currentCard.props.index, 'EFFECT');
                        app.game.endRound();
                        break;
                    }
                }
            }

            if (gameState === 'snapping') {
                for (var i = 0; i < entities.length; ++i) {
                    var entity = entities[i]; 
                    
                    // Snap the score pile 
                    if (entity.type.id === Entity.Types.ScorePile) {
                        player.snap();
                        break;
                    }
                }
            }
        }

        if (appState === 'connected') {
            for (var i = 0; i < entities.length; ++i) {
                var entity = entities[i];

                // Join the game
                if (entity.type.id  === Entity.Types.Button) {
                    app.transition('joining');
                    break;
                }    
            }
        }

    }
    
    ctx.currentCard = undefined;
}

module.exports = {
    events : ['mouse:up'],
    handler : mouseup
};
