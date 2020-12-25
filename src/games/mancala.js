/* eslint-disable max-len */
import BaseGame from './abstract';
// Describes the game of Mancala
// Moves:
// - Pick stones from a pit and sow sequentially
// Rules
// - If the last stone sown at the end of a move is at an empty pit, then COLLECT the stones at the opposite pit (opponent's pit)
// - If the last stone is at the player's own Mancala, then make a MOVE again
// - If a player's all pits are empty game ends. Other player collects their pit and adds to their Mancala. Count to see who wins

const MAX_PLAYERS = 2;

class Mancala extends BaseGame {
  // Setup the game given number of pits per player and number of stones per pit
  constructor(options) {
    super();
    // Parse options
    this.numberOfPlacesPerPlayer = options && options.numberOfPitsPerPlayer ? options.numberOfPitsPerPlayer + 1 : 7; // add one for Mancala
    this.numberOfStones = options && options.numberOfStones ? options.numberOfStones : 6;

    // placeholder for pits including Mancalas at (pitIndex % numberOfPlacesPerPlayer == numberOfPlacesPerPlayer-1)
    // player 1 has the first numberOfPitsPerPlayer indexes, player 2 has the second:
    // [pl1pit, pl1pit, pl1pit, pl1pit, pl1pit, pl1pit, pl1Mancala, pl2pit, pl2pit, pl2pit, pl2pit, pl2pit, pl2pit, pl2Mancala]
    this.pits = [];

    // Game Setup
    for (let i = 0; i < MAX_PLAYERS * this.numberOfPlacesPerPlayer; i += 1) {
      // It is a mancala!
      if (i % this.numberOfPlacesPerPlayer === this.numberOfPlacesPerPlayer - 1) {
        this.pits.push(0);
      } else {
        this.pits.push(this.numberOfStones);
      }
    }

    // Keep who plays next. Expect player 1 to begin
    this.nextMove = 0;
  }

  // Given player index (0 or 1) pick stones from a pit and distribute sequentially
  // Returns result object
  pick(playerIndex, pitIndex) {
    // default result object
    const result = {
      error: false,
      moveAgain: false, // if the player should make a move again
      gameEnded: false, // this is actually interchangable with results key below.
      results: [], // scores of all players
      pits: [], // game state
      message: `Player ${playerIndex}'s turn has ended.`, // message back for notifications
    };

    // INVALID moves: non-existent player, wrong turn, wrong pit for player
    const error = this.isInvalidMove(playerIndex, pitIndex);
    if (error) {
      result.error = true;
      result.message = error;
      return result;
    }

    // Valid move. Spread stones
    const lastPitIndex = this.playTurn(playerIndex, pitIndex);

    // Now its time to apply the RULES

    // Ended at player's mancala, play again
    if (this.isPlayersMancala(playerIndex, lastPitIndex)) {
      // Pick a pit and play again
      result.moveAgain = true;
      result.message = `Player ${playerIndex} plays again`;
      // Notice: next player stays the same
      return result;
    }

    // This was an own empty pit. Collect this pit and the opposite pit
    if (this.isPlayersPit(playerIndex, lastPitIndex) && this.pits[lastPitIndex] === 1) {
      // collect stones to player's Mancala
      this.collectOpponentsPit(playerIndex, lastPitIndex);
      // set result object
      result.message = `Player ${playerIndex} got opposite pit's stone. Turn has ended.`;
    }

    // set next player
    this.nextMove = this.getOpponent(this.nextMove);
    // check if game ends
    result.gameEnded = this.checkGameEnd();
    // not necessary, keeps live score anyway. Otherwise only call it when gameEnded=true
    result.results = this.calculateScores();
    // loads pits state for display
    result.pits = this.pits;

    return result;
  }

  // check if move is valid by two rules: whose turn? whose pit?
  isInvalidMove(playerIndex, index) {
    // Not you
    if (playerIndex >= MAX_PLAYERS) return 'Not a valid player';
    // Not your turn
    if (this.nextMove !== playerIndex) return 'It is not your turn';
    // Not your pit
    if (!this.isPlayersPit(playerIndex, index)) return 'Player selected a wrong pit';
    // Empty pit
    if (this.pits[index] === 0) return 'Selected pit is empty';
    // none
    return false;
  }

  // Distribute stones sequentially and return the last pit index
  playTurn(playerIndex, index) {
    const stones = this.pits[index];
    // no stone is left behind on that pit
    this.pits[index] = 0;
    let i = 0;
    let currentIndex = index;
    // sow stones until all of them are sown
    while (i < stones) {
      currentIndex += 1;
      // do not overflow the board :)
      currentIndex %= (MAX_PLAYERS * this.numberOfPlacesPerPlayer);
      // skip opponents mancala
      if (!this.isOpponentsMancala(playerIndex, currentIndex)) {
        // sow the stone into the next pit
        this.pits[currentIndex] += 1;
        i += 1;
      }
    }
    return currentIndex;
  }

  // better to relate this to exact terminology of the game (e.g. win? collect? )
  collectOpponentsPit(playerIndex, index) {
    // First collect the last stone in owned pit
    this.pits[index] = 0;
    this.pits[this.getPlayersMancala(playerIndex)] += 1;

    // opposite pit is its complementary to 13 e.g. pit index 0 -> 13, 1 -> 12 etc...
    const oppositePitIndex = this.getOppositePit(index);
    // get stones in the opposite pit
    const stones = this.pits[oppositePitIndex];
    // empty opposite pit
    this.pits[oppositePitIndex] = 0;
    // place into own mancala
    this.pits[this.getPlayersMancala(playerIndex)] += stones;
  }

  getState() {
    return {
      id: this.id,
      pits: this.pits,
      nextMove: this.nextMove,
    };
  }

  restoreFromState(state) {
    this.id = state.id;
    this.pits = state.pits;
    this.nextMove = state.nextMove;
  }

  // helper functions

  getPlayersMancala(playerIndex) {
    return (playerIndex + 1) * this.numberOfPlacesPerPlayer - 1;
  }

  getPlayerPitStartIndex(playerIndex) {
    return playerIndex * this.numberOfPlacesPerPlayer;
  }

  // eslint-disable-next-line class-methods-use-this
  getOpponent(playerIndex) {
    return (playerIndex + 1) % MAX_PLAYERS;
  }

  // opposite pit is its complementary to 13 e.g. pit index 0 -> 13, 1 -> 12 etc...
  getOppositePit(index) {
    return MAX_PLAYERS * this.numberOfPlacesPerPlayer - index - 1;
  }

  isPlayersPit(playerIndex, index) {
    // check if it is in range e.g. 0-5 player1 pits, 7-12 player2 pits
    return (index < (playerIndex + 1) * this.numberOfPlacesPerPlayer - 1 && index > playerIndex * this.numberOfPlacesPerPlayer - 1);
  }

  isPlayersPlace(playerIndex, index) {
    return (this.isPlayersPit(playerIndex, index) || this.isPlayersMancala(playerIndex, index));
  }

  isMancala(index) {
    return (index % this.numberOfPlacesPerPlayer) === this.numberOfPlacesPerPlayer - 1;
  }

  isPlayersMancala(playerIndex, index) {
    return index === ((playerIndex + 1) * this.numberOfPlacesPerPlayer - 1);
  }

  isOpponentsMancala(playerIndex, index) {
    const opponentPlayerIndex = this.getOpponent(playerIndex);
    return this.isPlayersMancala(opponentPlayerIndex, index);
  }

  checkGameEnd() {
    for (let playerIndex = 0; playerIndex < MAX_PLAYERS; playerIndex += 1) {
      let sum = 0;
      // loop through player's pits
      for (let pitIndex = this.getPlayerPitStartIndex(playerIndex); this.isPlayersPit(playerIndex, pitIndex); pitIndex += 1) {
        // count stones in pits
        sum += this.pits[pitIndex];
      }
      // player has no more stones in owned pits
      if (sum === 0) return true;
    }
    return false;
  }

  calculateScores() {
    const scores = [];
    for (let playerIndex = 0; playerIndex < MAX_PLAYERS; playerIndex += 1) {
      // loop through player's pits
      let sum = 0;
      for (let pitIndex = this.getPlayerPitStartIndex(playerIndex); this.isPlayersPlace(playerIndex, pitIndex); pitIndex += 1) {
        // count stones in player's pits and mancalas
        sum += this.pits[pitIndex];
      }
      scores[playerIndex] = sum;
    }
    return scores;
  }
}

module.exports = Mancala;
