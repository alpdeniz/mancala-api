const express = require('express');
const { v1: uuidv1 } = require('uuid');
const app = express();
const mancala = require('./mancala')

let games = {};

app.get('/', (req, res) => {
    res.send('Mancala Game API');
});

app.get('/start', (req, res) => {

    // example options
    // let options = {
    //     numberOfPitsPerPlayer: 6,
    //     numberOfStonesPerPit: 6
    // }

    // generate a game id, keep in a cookie or auth etc.
    let newid = uuidv1()
    // init the game on memory
    games[newid] = new mancala( /*options*/ )
    games[newid].id = newid;
    // Send back game id and show game table on browser
    res.send(JSON.stringify(games[newid]))
});

// Move actions are sent through this route.
app.get('/move', (req, res) => {
    let gameId = req.query.id
    let playerIndex = req.query.player
    let pitIndex = req.query.pit

    console.log("Games", games);
    // Check request params
    if (!games[gameId]) {
        res.send("No such game with that id")
        return
    }
    if (!playerIndex || !pitIndex) {
        res.send("Please supply player and pit index to make a move")
        return
    }

    result = games[gameId].pick(playerIndex, pitIndex)

    res.send(JSON.stringify(result));
});

const port = 8080;
app.listen(port, () => console.log(`Mancala Game API has started at port ${port}`));