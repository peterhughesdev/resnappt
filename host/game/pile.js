function Pile() {

    var top = null;

    var state = null;
    var effects = [];

    this.init = function(card) {
        top = card;
        state = {top : top};
    };

    this.getTop = function() {
        return top;
    };

    this.getEffects = function() {
        return effects;
    };

    this.getState = function() {
        return state;
    };

    this.playEffect = function(card) {
        if (effects.length < 3) {
            effects[effects.length] = card;
            return true;
        }
        return false;
    };

    this.matchRunes = function() {
        return matchRunes(state.top.modrune, state.played.modrune);
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

    this.play = function(card, reduce) {
        state = {
            top : top,
            played : card,
            newCard : false,
            prevScore : false,
            snap : true
        };

        state.top.modrune = state.top.rune;
        state.played.modrune = state.played.rune;
        state.played.modvalue = state.played.value;
        state.snap = true;

        for (var e in effects) {
            effects[e].execute(state, reduce);
            if (effects[e].remaining() < 1) {
                effects.splice(e,1);
            }
        }

        state.score = 0;

        var topRune = state.top.modrune;
        var playedRune = state.played.modrune;
        if (matchRunes(topRune, playedRune)) {
            state.score = state.played.modvalue;
        }

        top = card;
        return state;
    };
};

module.exports = Pile;
