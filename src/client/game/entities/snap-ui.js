var Entity = require('./entity');
var Text = require('./text');

var SnapGUI = Entity.type('SnapGUI', {
    width : 200,
    height : 200,
    texture : '/images/effect.png'
});

function SnapGUIFactory(x, y) {
    var circle = Entity.create(SnapGUI, {
        x : x,
        y : y
    });

    var text = Text(0, -10, '', 80, 'white');

    circle.sprite.addChild(text.sprite);
    circle.text = text;
    return circle;
}

module.exports = SnapGUIFactory;
