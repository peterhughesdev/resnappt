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

    var filter = new PIXI.ColorMatrixFilter();

    filter.matrix = [0.25, 0.00, 0.50, 0.00,
                     0.00, 1.00, 0.00, 0.00,
                     0.50, 0.00, 1.00, 0.00,
                     0.00, 0.00, 0.00, 1.00];

    circle.sprite.filters = [filter];

    circle.sprite.addChild(text.sprite);
    circle.text = text;
    return circle;
}

module.exports = SnapGUIFactory;
