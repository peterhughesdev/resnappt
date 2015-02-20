var Entity = require('./entity');

var Button = Entity.type('Button', {
    width : 145,
    height : 149,
    texture : '/images/join-btn.png'
});

function ButtonFactory(x, y) {
    return Entity.create(Button, {
        x : x,
        y : y
    });
}

module.exports = ButtonFactory;
