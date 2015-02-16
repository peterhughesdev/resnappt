var Entity = require('./entity');

function Card(x, y, onMove) {
    var dragging = false;
    var dragOffset = null;

    return Entity.create({
            x : x,
            y : y,

            width : 100,
            height : 170,
            
            texture : '/images/card.jpg',

            interactive : true,
           
            mousedown : function() {
                dragging = true;
            },

            mouseup : function() {
                dragging = false;
            },

            mousemove : function(data) {
                if (dragging) {
                    var pos = data.getLocalPosition(this.sprite.parent);

                    this.sprite.position.x = pos.x
                    this.sprite.position.y = pos.y

                    onMove(this.sprite.position);
                }
            }
    });
}

module.exports = Card;
