var index = 0;

function Card(rune, value, effect) {
    var self = this;
    this.effect = effect;
    this.rune = rune;
    this.value = value;

    this.index = index++;

    var func = effect.func;
    var name = effect.name;
    var duration = effect.duration;

    this.name = function() {
        return name;
    };

    this.execute = function(state, reduce) {
        if (self.effect.delay) {
            self.effect.delay = false;
            return state;
        }

        // we want to calculate the modifications due to effects on riposte
        // but not reduce the effect duration
        if (reduce) {
            duration = duration - 1;
        }
        state.effectRune = self.rune;
        return func(state);
    };

    this.remaining = function() {
        return duration;
    };

    this.toData = function() {
        var result = {};
        result.effect = {};
        result.index = self.index;
        result.effect.name = self.effect.name;
        result.effect.duration = duration;
        result.rune = self.rune;
        result.value = self.value;
        return result;
    };
};

Card.reset = function() {
    index = 0;
};

module.exports = Card;

