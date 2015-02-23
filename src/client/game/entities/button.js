var Entity = require('./entity');

var Button = Entity.type('Button', {
    width : 200,
    height : 200,
    texture : '/images/effect.png'
});

function ButtonFactory(x, y) {
    return Entity.create(Button, {
        x : x,
        y : y
    });
}

module.exports = ButtonFactory;
