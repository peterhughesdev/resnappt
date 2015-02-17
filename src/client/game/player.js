function Player(transport) {
    
    this.play = function(card, pile) {
        transport.dispatch('PLAY', {
            card : card,
            pile : pile
        }); 
    };

    this.ready = function() {
        transport.dispatch('READY');
    };

    this.snap = function() {
        transport.dispatch('SNAP');
    };
}

module.exports = Player;
