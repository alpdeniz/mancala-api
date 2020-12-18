# Mancala Game API

Implements a basic http API for the game, Mancala (see [mancala](https://en.wikipedia.org/wiki/Mancala))

## Installation
    git clone {this repo} {dir}
    cd {dir}
    npm install
    npm start`

To test:

    npm test

## How to
A player gets in and calls "/start" to start a game stored in memory

Shares the game ID returned with another player

'Player 0' begins by calling "/move?id={gameID}&player=0&pit={selectedPit}

'Player 1' goes on by calling "/move?id={gameID}&player=1&pit={selectedPit}

And so on.
