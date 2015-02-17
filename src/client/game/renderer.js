var Type = {
    ADD : 0,
    REMOVE : 1
};


function Renderer(game, width, height) {
    var renderer = PIXI.autoDetectRenderer(width, height); 
    var stage = new PIXI.Stage('#000000', true);

    var running = false;

    var entities = [];
    var pending = [];
    
    function tick() {
        pending.forEach(function(action) {
            switch (action.type) {
                case Type.ADD :
                    stage.addChild(action.entity.sprite);
                    entities.push(action.entity);
                    break;
                case Type.Remove :
                    stage.removeChild(action.entity.sprite);

                    var i = entities.indexOf(action.entity);
                    if (i > -1) {
                        entities.splice(i, 1);
                    }
                    
                    break;
            }
        });   

        pending = [];

        entities.forEach(function(entity) {
            entity.tick(game);
        });

        renderer.render(stage);

        if (running) {
            requestAnimationFrame(tick);
        }
    }

    this.add = function(entity) {
        pending.push({
            type : Type.ADD,
            entity : entity
        });
    };

    this.remove = function(entity) {
        pending.push({
            type : Type.REMOVE,
            entity : entity
        });
    };

    this.init = function() {
        document.body.appendChild(renderer.view);
        
        requestAnimationFrame(tick);
        running = true;
    };
}

module.exports = Renderer;
