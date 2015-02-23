var Entity = require('./entity');

var GUI = Entity.type('PlayerGUI', {
    width : 300,
    height : 200,
    texture : '/images/join-btn.png'
});

function GUIFactory(x, y, name, score, icon) {
    var gui = Entity.create(GUI, {
        x : x,
        y : y
    });

    gui.sprite.addChild(name.sprite);
    gui.sprite.addChild(score.sprite);
    gui.sprite.addChild(icon.sprite);

    return gui;
}  

module.exports = GUIFactory;
