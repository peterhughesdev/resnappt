var Entity = require('./entity');

var Background = Entity.type('Background', {
    width : 2048,
    height : 1536,
    texture : '/images/background.png'
});

function BackgroundFactory() {
    var bg = Entity.create(Background, {
        x : 1024,
        y : 768
    });
    // var normalsImage = PIXI.Texture.fromImage('/images/background-normals.png');
    // var normals = new PIXI.NormalMapFilter(normalsImage);
    // bg.normals = normals;
    // bg.sprite.filters = [normals];
    return bg;
};

module.exports = BackgroundFactory;
