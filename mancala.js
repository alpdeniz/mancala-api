// Describes the game of Mancala
// Moves:
// - Pick stones from a pit and sow sequentially
// Rules
// - If the last stone sown at the end of a move is at an empty pit, then COLLECT the stones at the opposite pit (opponent's pit)
// - If the last stone is at the player's own Mancala, then make a MOVE again
// - If a player's all pits are empty game ends. Other player collects their pit and adds to their Mancala. Count to see who wins

const MAX_PLAYERS = 2;

class Mancala {


    // Setup the game given number of pits per player and number of stones per pit
    constructor(options) {

        // Parse options
        this.numberOfPlacesPerPlayer = options && options.numberOfPitsPerPlayer? options.numberOfPitsPerPlayer+1 : 7; // add one for Mancala
        this.numberOfStones = options && options.numberOfStones? options.numberOfStones : 6;

        // placeholder for pits including Mancalas at (pitIndex % numberOfPlacesPerPlayer == numberOfPlacesPerPlayer-1)
        // player 1 has the first numberOfPitsPerPlayer indexes, player 2 has the second: 
        // [pl1pit, pl1pit, pl1pit, pl1pit, pl1pit, pl1pit, pl1Mancala, pl2pit, pl2pit, pl2pit, pl2pit, pl2pit, pl2pit, pl2Mancala]
        this.pits = [];

        // Game Setup
        for (let i=0; i < MAX_PLAYERS * this.numberOfPlacesPerPlayer; i++) {
            // A mancala
            if (i % this.numberOfPlacesPerPlayer == this.numberOfPlacesPerPlayer-1) {
                this.pits.push(0)
            } else {
                this.pits.push(this.numberOfStones)
            }
        }

        // Keep who plays next. Expect player 1 to begin
        this.nextMove = 0;
    }

    // Given player index (0 or 1) pick stones from a pit and distribute sequentially
    // Returns {moveAgain: bool, gameEnded: bool}
    pick(playerIndex, pitIndex) {

        // default result object
        let result = {
            error: false, 
            moveAgain: false, // if the player should make a move again
            gameEnded: false, // this is actually interchangable with results key below. 
            results: [], // scores of all players
            message: `Player ${playerIndex}'s turn has ended.` // message back for notifications
        }

        // INVALID moves
        // Not your turn
        if (this.nextMove != playerIndex) {
            result.error = true;
            result.message = "It is not your turn";
            return result
        }
        // Not your pit
        if (!this.isPlayersPit(pitIndex, playerIndex)) {
            result.error = true;
            result.message = "Player selected a wrong pit";
            return result
        }
        
        // Valid move. Go on
        let stones = this.pits[pitIndex];
        // no stone is left behind on that pit
        this.pits[pitIndex] = 0;
        let i = 0;
        // sow stones until all of them are sown
        while (i < stones) {
            pitIndex++;
            // mod pit index
            pitIndex = pitIndex % (MAX_PLAYERS * this.numberOfPlacesPerPlayer)
            // skip opponents mancala
            if (this.isOpponentsMancala(pitIndex, playerIndex)) {
                console.log("Opponent mancala!")
                continue
            }
            // sow the stone into the next pit
            this.pits[pitIndex]++
            i++;
        }

        // Now its time to apply the RULES

        // This was an own empty pit. Collect this pit and the opposite pit
        if (this.isPlayersPit(pitIndex, playerIndex) && this.pits[pitIndex] == 1) {

            // First collect the last stone in owned pit
            this.pits[pitIndex] = 0;
            this.pits[this.getPlayersMancala()] += 1;

            // opposite pit is its complementary to 13 e.g. pit index 0 -> 13, 1 -> 12 etc...
            oppositePitIndex = getOppositePit(pitIndex)
            // get stones in the opposite pit 
            stones = this.pits[oppositePitIndex]
            // empty opposite pit
            this.pits[oppositePitIndex] = 0
            // place into own mancala
            this.pits[getPlayersMancala(playerIndex)] += stones
            
            // set result object
            result.message = `Player ${playerIndex} got opposite pit's stone. Turn has ended.`
        }
        // Ended at player's mancala, play again
        else if (this.isPlayersMancala(pitIndex, playerIndex)) {

            // Pick a pit and play again
            result.moveAgain = true
            result.message = `Player ${playerIndex} plays again`
            // Notice: next player stays the same
            return result
        }

        // set next player
        this.nextMove = this.getOpponent(this.nextMove)

        // check if game ends
        result.gameEnded = this.checkGameEnd()
        // not necessary, keeps live score anyway. Otherwise only call it when gameEnded=true
        result.results = this.calculateScores()

        return result
    }

    // helper functions

    getPlayersMancala(playerIndex) {
        return (playerIndex+1) * this.numberOfPlacesPerPlayer - 1
    }

    getPlayerPitStartIndex(playerIndex) {
        return playerIndex*this.numberOfPlacesPerPlayer
    }

    getOpponent(playerIndex) {
        return (playerIndex + 1) % MAX_PLAYERS
    }

    // opposite pit is its complementary to 13 e.g. pit index 0 -> 13, 1 -> 12 etc...
    getOppositePit(index) {
        return MAX_PLAYERS*this.numberOfPlacesPerPlayer - index - 1
    }

    isPlayersPit(index, playerIndex) {
        // check if it is in range e.g. 0-5 player1 pits, 7-12 player2 pits
        return (index < (playerIndex+1)*this.numberOfPlacesPerPlayer-1 && index > playerIndex*this.numberOfPlacesPerPlayer-1)
    }

    isPlayersPlace(index, playerIndex) {
        return (this.isPlayersPit(index, playerIndex) || this.isPlayersMancala(index, playerIndex))
    }

    isMancala(index) {
        return (index % this.numberOfPlacesPerPlayer) == this.numberOfPlacesPerPlayer-1
    }

    isPlayersMancala(index, playerIndex) {
        return index == ((playerIndex+1) * this.numberOfPlacesPerPlayer -1)
    }

    isOpponentsMancala(index, playerIndex) {
        let opponentPlayerIndex = this.getOpponent(playerIndex)
        return this.isPlayersMancala(index, opponentPlayerIndex)
    }

    checkGameEnd() {
        for (let playerIndex =0; playerIndex < MAX_PLAYERS; playerIndex++) {
            let sum = 0
            // loop through player's pits
            for (let pitIndex = this.getPlayerPitStartIndex(playerIndex); this.isPlayersPit(pitIndex, playerIndex); pitIndex++) {
                // count stones in pits
                sum += this.pits[pitIndex];
            }
            // player has no more stones in owned pits
            if (sum == 0)
                return true
        }
        return false
    }

    calculateScores() {
        let scores = [];
        for (let playerIndex = 0; playerIndex < MAX_PLAYERS; playerIndex++) {
            // loop through player's pits
            let sum = 0;
            for (let pitIndex = this.getPlayerPitStartIndex(playerIndex); this.isPlayersPlace(pitIndex, playerIndex); pitIndex++) {
                // count stones in player's pits and mancalas
                sum += this.pits[pitIndex];
            }
            scores[playerIndex] = sum;
        }
        return scores
    }
}

module.exports = Mancala