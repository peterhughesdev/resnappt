var Entity = require('./entity');

var Button = Entity.type('Button', {
    width : 150,
    height : 150,
    texture : '/images/join-btn.png'
});

function ButtonFactory(x, y) {
    return Entity.create(Button, {
        x : x,
        y : y
    });
}

module.exports = ButtonFactory;
