function Player(transport) {
    
    this.play = function(card, pile) {
        transport.dispatch('PLAY', {
            card : card,
            pile : pile
        }); 
    } 
}

module.exports = Player;
