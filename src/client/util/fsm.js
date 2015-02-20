var EventEmitter = require('events').EventEmitter;

/**
 * Minimal finite state machine implementation. Allows directed transitions
 * between states.
 * <P>
 * States are provided as an object, with each key being single distinct state.
 * Each state's value within the object should be an array of strings, which
 * dictates the available states that are legal to transition to.
 * <P>
 * If a state may transition to any other state, the string <code>'*'</code>
 * may be provided instead of an array.
 * <P>
 * If a state is terminal, it should simply provide an empty array.
 *
 * @example
 * // Create a state machine with three states:
 * // 'a' may transition to 'b' or 'c'
 * // 'b' is a terminal state
 * // 'c' may transition to any state
 *
 * var states = {
 *     a : ['b', 'c'],
 *     b : [],
 *     c : '*'
 * };
 *
 * var fsm = FSM.create('a', states);
 *
 * states.change('c'); // => true
 * states.change('a'); // => true
 * states.change('b'); // => true
 * states.change('c'); // => false
 * states.change('a'); // => false
 *
 * @constructor
 * @param String initial - The initial state that this FSM should be in.
 * @param Object states - The set of possible states to transition between
 */
function FSM(initial, states) {
    EventEmitter.call(this);
    var self = this;

    var current = states[initial];

    /**
     * The current state
     *
     * @memberof FSM
     */
    this.state = initial;

    /**
     * Change the state. Will return whether the transition was allowed or not.
     *
     * @function FSM#change
     */
    this.change = function change(state) {
        if (self.state === state) {
            return true;
        }

        if (states[state] && (current === '*' || current.indexOf(state) > -1)) {
            current = states[state];
            var old = self.state;

            self.state = state;
            self.emit('change', old, state);

            return true;
        }

        return false;
    };
}

FSM.prototype = new EventEmitter();

module.exports = {
    create : function create(initial, states) {
        return new FSM(initial, states);
    }
}
