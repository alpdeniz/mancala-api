import express from 'express';
import Mancala from './games/mancala';
import MongoDBA from './dba/mongo';

const app = express();

// default error object
const error = {
  error: true,
  message: 'Error',
};

const defaultOptions = {
  numberOfPitsPerPlayer: 6,
  numberOfStones: 6,
};

const dba = new MongoDBA('mancala');

// Web handlers
//= ================
// start and set the game in memory
const setupGame = (req, res) => {
  // init game
  const game = new Mancala(defaultOptions);
  const gameState = game.getState();
  // save
  try {
    dba.new(gameState);
    // Send back game id and show game table on browser
    res.json(gameState);
  } catch (e) {
    res.json(e);
  }
};

const validateParams = (playerIndex, pitIndex) => {
  try {
    if (Number.isNaN(playerIndex) || Number.isNaN(pitIndex)) return 'Please supply player and pit index to make a move';
    return false;
  } catch (e) {
    return e.message;
  }
};

// Make the move and serve the resulting object
async function makeMove(req, res) {
  // init game object
  const game = new Mancala(defaultOptions);
  // get params
  const gameId = req.query.id;
  const playerIndex = parseInt(req.query.player, 10);
  const pitIndex = parseInt(req.query.pit, 10);

  // Check request params
  const errorMsg = validateParams(playerIndex, pitIndex);
  if (errorMsg) {
    error.message = errorMsg;
    res.json(error);
    return;
  }

  const gameState = await dba.get(gameId);

  if (!gameState) {
    error.message = `Game ${gameId} not found`;
    res.json(error);
    return;
  }

  try {
    game.restoreFromState(gameState);
  } catch (e) {
    error.message = `Error restoring game ${gameId} from state`;
    // TODO: log e
    res.json(error);
    return;
  }

  // make the move and retrieve result
  const result = game.pick(playerIndex, pitIndex);

  // save before serving
  dba.update(game.getState());

  res.json(result);
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
