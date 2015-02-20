var Entity = require('./entity');

var Board = Entity.type('Board', {
    width : 660,
    height : 660,
    texture : '/images/rune.png'
});

function BoardFactory(x, y, id) {
    return Entity.create(Board, {
        x : x,
        y : y,
        name : id
    });
};

module.exports = BoardFactory;
