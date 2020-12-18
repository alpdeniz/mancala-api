const express = require('express');
const { v1: uuidv1 } = require('uuid');
const app = express();
const mancala = require('./mancala')

// hold each game in memory
let games = {};

// default error object
let error = {
    error: true,
    message: "Error"
}

// Web handlers
//=================
// start and set the game in memory
let setupGame = (req, res) => {

    // generate a game id, keep in a cookie or auth etc.
    let newid = uuidv1()
    // init the game on memory
    games[newid] = new mancala( /*options*/ ) // optional options = {numberOfStones: 6, numberOfPitsPerPlayer: 6}
    games[newid].id = newid;
    // Send back game id and show game table on browser
    res.json(games[newid])
}

let validateParams = (gameId, playerIndex, pitIndex) => {
    try {
        if (!games[gameId])
            return "No such game with that id";

        if (!playerIndex || !pitIndex) {
            return "Please supply player and pit index to make a move";
        }
    } catch(e) {
        return e.message
    }
}

// Make the move and serve the resulting object
let makeMove = (req, res) => {

    // get params
    let gameId = req.query.id
    let playerIndex = req.query.player
    let pitIndex = req.query.pit

    console.log("Games", games);
    // Check request params
    let errorMsg = validateParams(gameId, playerIndex, pitIndex)
    if (errorMsg) {
        error.message = errorMsg;
        res.json(error)
        return
    }

    // make the move and retrieve result
    result = games[gameId].pick(playerIndex, pitIndex)
    // remove game if ended
    if (result.gameEnded) {
        delete games[gameId];
    }

    res.json(result)
}


// Dummy landing page
app.get('/', (req, res) => {
    res.send('Mancala Game API');
});

// init a game
app.get('/start', setupGame);

// Move actions are sent through this route.
app.get('/move', makeMove);

const port = 8080;
app.listen(port, () => console.log(`Mancala Game API has started at port ${port}`));
