var runes = ['a', 'b', 'c', 'd'];

exports.random = function() {
    return runes[parseInt(Math.random() * runes.length, 10)];
};
