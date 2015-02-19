#RESNAPPT

The new craze sweeping the nation; the classic fun of Snap, as delivered on an enterprise sass offering!!!


## Setup

- 1 Deck
- Score Card Pile
- 3 Effect Card slots 
- Player Hand - 3 cards (private)

## Rules
### Per turn
Each player draws cards from the deck into their hand, up to their hand limit

The player may then play as many cards as they have available, with their turn terminated by playing a card to the 
Score Pile or choosing to Pass.

If the player plays a score card that matches the current top of the score pile, that player is awarded the number of
points defined by the card played (modifiable by any active effect cards).

### Win
When the last card is drawn, the game enters the final round. The score card countdown becomes the Final Countdown,
awarding 100% of the score.

### Effect cards
A player may choose to play a card as an Effect Card, if there is an empty Effect Card slot available on the board.

An Effect Card remains on the board for as many turns as specified by it's duration count.

The specified effect becomes active once the card is played; this applies to any subsequent cards played by the same 
player in that turn, as well as all other players who play while the effect is active.

### Score cards
A player can play at most one score card per turn. Once played, there is a five-second timer during which other players
may hit the deck. If the top 2 score cards were matches, then the first player to hit the deck is awared 50% of the score,
modifiable by any active effect cards.



## Cards
Score is randomised

#### Guard 
Duration : 3
Effect : Snap has no effect

#### Double
Duration : 2
Effect : All score cards provide double points

#### Prism / Alchemy
Duration : 3
Effect : Colour [x] matches all colours

#### Ward
Duration : 3
Effect : Colour [x] matches no colours

#### Blockade 
Duration : 2 - 8
Effect : No effect

#### Riposte 
Duration : 4 
Effect : Immediately plays a new score card from the deck after the current player's turn ends, but before the snap
timer is activated.

#### Duplication 
Duration : 1
Effect : If a player matches, the previous player receives the same score




## Development

### Priorities

*high* Server-side host
    - Manages room / players
    - Generates deck
    - Handles card assignment
    - Assigns topic permissions to players for public/private data

## Topics and data

### Sessions

- sessions/[sessionID]
    - Created by the client session
    - Server responds with a JSON object
            
            {
                type : 'PLAYER',
                turn : turnIndex
            }
        or
            {
                type : 'SPECTATOR'
            }

- sessions/[sessionID]/command
    - Created by the client session
    - Client sends commands on this topic, as a JSON object

            {command : 'READY'}
            {command : 'SNAP'}
            {command : 'PLAY', message : {card : 1, pile : pile}}
        where pile can be 'EFFECT' or 'SCORE'

- sessions/[sessionID]/score
    - The score of the specified player
    - Integer

- sessions/[sessionID]/hand
    - An array of cards in the players hand
    - JSON

            [{
                effect : {
                    name : 'effectName',
                    duration : 3
                },
                index : 1,
                rune : 'a',
                value : 8
            }]

### Game
- turn
    - Updated with the sessionID of the player whose turn it is
    - String

- deck
    - Updated with the number of cards remaining in the deck
    - Integer

- pile/score
    - Publishes the card currently on top of the score pile
    - JSON

            {
                effect : {
                    name : 'effectName',
                    duration : 3
                },
                index : 1,
                rune : 'a',
                value : 8
            }

- pile/effect
    - An array of effect cards currently in play
    - JSON

            [{
                effect : {
                    name : 'effectName',
                    duration : 1
                },
                index : 1,
                rune : 'a',
                value : 8
            }]

- snap/timer
    - The current value of the snap timer. Starts at 5, ends on 0. 0 When not in use
    - Integer

- snap/winner
    - The sessionID of the winner of the current snap round
    - String

- summary
    - A summary of scores for all of the players, published at the end of the game
    - JSON

            [{
                playerID : [player's sessionID],
                score : 42
            }]
