function Card(rune, value, effect) {
    var self = this;
    this.effect = effect;
    this.rune = rune;
    this.value = value;

    var duration = effect.duration;
    var func = effect.func;
    var delay = effect.delay;
    var name = effect.name;

    this.name = function() {
        return name;
    };

    this.execute = function(state) {
        if (delay) {
            delay = false;
            return state;
        }

        duration = duration - 1;
        state.effectRune = self.rune;
        return func(state);
    };

    this.remaining = function() {
        return duration;
    };
};

module.exports = Card;

