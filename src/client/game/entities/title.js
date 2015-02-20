var Entity = require('./entity');

var Title = Entity.type('Title', {
    width : 656,
    height : 72,
    texture : '/images/title.png'
});

function TitleFactory(x, y) {
    return Entity.create(Title, {
        x : x,
        y : y
    });
};

module.exports = TitleFactory;
