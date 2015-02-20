// most common score
var mean = 3;
// spread of scores (higher value makes the distribution flatter)
var stdev = 4;
// lowest score card value
var lowVal = 1;
// highest score card value
var highVal = 9;
// cards per player
var cardsPerPlayer = 10;
// add/subtract a number of cards based on number of players (this * nPlayers)
var playerMultiplier = 0;
// maximum hand size
exports.MAX_HAND = 3;

/*
 * Gaussian function
 */
var gaus = function(x, mu, sig) {
    var num = Math.exp(-1*(x-mu)*(x-mu)/(2*sig*sig));
    var den = Math.sqrt(2*Math.PI)*sig;

    var p = num / den;
    return p;
};

/*
 * Discrete cumulative probability distribution calculator
 */
var cumulativeProb = function(start, end, norm) {
    var normalisation = norm || 1.0;
    var total = 0;
    for (var x=start; x<end; x++) {
        var p = gaus(x, mean, stdev) / normalisation;
        total += p;
    }
    return total;
};

/*
 * Find the value of x for which the cumulative probabilty exceeds the requested threshold
 */
var threshold = function(start, end, thres) {
    var total = 0;
    var norm = cumulativeProb(start, end);
    for (var x=start; x<end; x++) {
        var p = gaus(x, mean, stdev) / norm;
        total += p;
        if (total > thres) {
            return x;
        }
    }
    return end;
};

var randomGaus = function() {
    var thres = Math.random();

    var x = threshold(lowVal, highVal, thres);
    return x;
};

exports.generateScoreValue = randomGaus;

exports.numberOfCards = function(nPlayers) {
    var baseCards = cardsPerPlayer * nPlayers;
    var modifier = playerMultiplier * nPlayers;

    return baseCards + modifier;
};
