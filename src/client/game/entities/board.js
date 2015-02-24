var Entity = require('./entity');

var Board = Entity.type('Board', {
    width : 260,
    height : 260,
    texture : '/images/transparent.png'
});

var BCircle = Entity.type('BCircle', {
    width : 660,
    height : 660,
    texture : '/images/board_1.png'
});

var BSquare = Entity.type('BSquare', {
    width : 660,
    height : 660,
    texture : '/images/board_2.png'
});

var BStar = Entity.type('BStar', {
    width : 660,
    height : 660,
    texture : '/images/board_3.png'
});


function BoardFactory(x, y, id) {
    var board = Entity.create(Board, {
        x : x,
        y : y,
        name : id
    });

    var circle = Entity.create(BCircle, { x : 0, y : 0 });
    var square = Entity.create(BSquare, { x : 0, y : 0 });
    var stars = Entity.create(BStar, { x: 0, y : 0 });

    board.sprite.addChild(circle.sprite);
    board.sprite.addChild(square.sprite);
    board.sprite.addChild(stars.sprite);

    return board;
};

module.exports = BoardFactory;
