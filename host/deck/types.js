var types = [
    {
        name : 'Guard',
        func : function(state) {
            state.guard = true;
            return state;
        },
        duration : 3
    },
    {
        name : 'Plunder',
        func : function(state) {
            state.played.modvalue = state.played.modvalue * 2;
            return state;
        },
        duration : 2
    },
    {
        name : 'Alchemy',
        func : function(state) {
            if (state.top.rune === state.effectRune) {
                state.top.modrune = 'all';
            }
            if (state.played.rune === state.effectRune) {
                state.played.modrune = 'all';
            }
            return state;
        },
        duration : 3
    },
    {
        name : 'Necromancy',
        func : function(state) {
            if (state.top.rune === state.effectRune) {
                state.top.modrune = 'none';
            }
            if (state.played.rune === state.effectRune) {
                state.played.modrune = 'none';
            }
            return state;
            return state;
        },
        duration : 3
    },
    {
        name : 'Blockade',
        func : function(state) {
            return state;
        },
        duration : 4
    },
    {
        name : 'Riposte',
        func : function(state) {
            state.riposte = true;
            return state;
        },
        duration : 4
    },
    {
        name : 'Duplication',
        duration : 1,
        func : function(state) {
            state.duplication = true;
            return state;
        },
        delay : true
    }
];

exports.random = function() {
    return types[parseInt(Math.random() * types.length, 10)];
};
