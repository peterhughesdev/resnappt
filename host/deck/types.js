var types = [
    {name : 'Guard', effect : 1},
    {name : 'Double', effect : 2},
    {name : 'Alchemy', effect : 3},
    {name : 'Ward', effect : 4},
    {name : 'Blockade', effect : 5},
    {name : 'Riposte', effect : 6},
    {name : 'Duplication', effect : 7}
];

exports.random = function() {
    return types[parseInt(Math.random() * types.length, 10)];
};
