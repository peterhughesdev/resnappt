var types = [
    {
        name : 'Guard',
        func : function(state) {
            state.snap = false;
            return state;
        },
        duration : 3
    },
    {
        name : 'Double',
        func : function(state) {
            state.played.value = state.played.value * 2;
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
        name : 'Ward',
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
    // {
    //     name : 'Riposte',
    //     func : function(state) {
    //         state.newCard = true;
    //         return state;
    //     },
    //     duration : 4
    // },
    {
        name : 'Duplication',
        duration : 1,
        func : function(state) {
            state.prevScore = true;
            return state;
        },
        delay : true
    }
];

exports.random = function() {
    return types[parseInt(Math.random() * types.length, 10)];
};
