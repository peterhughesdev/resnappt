function Pile() {

    var top = null;

    var effects = [];

    this.init = function(card) {
        top = card;
    };

    this.playEffect = function(card) {
        if (effects.length < 3) {
            effects[effects.length] = card;
            return true;
        }
        return false;
    };

    var matchRunes = function(runeA, runeB) {
        if (runeA === 'all' || runeB === 'all') {
            return true;
        } else if (runeA === 'none' || runeB === 'none') {
            return false;
        } else if (runeA === runeB) {
            return true;
        } else {
            return false;
        }
    };

    this.play = function(card) {
        var state = {top : top, played : card};

        for (var e in effects) {
            effects[e].execute(state);
            if (effects[e].remaining() === 0) {
                effects.splice(e,1);
            }
        }

        var score = 0;

        if (matchRunes(state.top.rune, state.played.rune)) {
            score = state.played.value;
        }

        top = card;
        return score;
    };
};

module.exports = Pile;
