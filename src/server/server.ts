import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose, { Error } from 'mongoose';
import { createNewGameState } from '../GameState';
import ActiveGameModel from './models/ActiveGame';
import PlayerGameModel from './models/PlayerGame';
import { PlayerColor } from '../types';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
const URI = process.env.MONGODB_URI;
if (!URI) {
  throw new Error('MONGODB_URI is not defined in the environment variables.');
}

mongoose.connect(URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Create a game and have player join as red
app.post('/game/create', async (req, res) => {
  try {
    const { gameId, playerId, playerColor } = req.body;

    // Check if the game already exists
    let gameState = await ActiveGameModel.findOne({ gameId });
    if (gameState) {
      return res.status(400).json({ message: 'Game already exists with this gameId.' });
    }

    // Check if player is already associated with a game
    let playerGame = await PlayerGameModel.findOne({ playerId });
    if (playerGame) {
      return res.status(400).json({ message: 'Player is already associated with a game.' });
    }

    // Create a new game state
    const newGameState = createNewGameState();
    newGameState.players[playerColor as PlayerColor].id = playerId;

    const newGame = new ActiveGameModel({ gameId: gameId, gameState: newGameState });
    await newGame.save();

    // Associate player with this game
    playerGame = new PlayerGameModel({ playerId, gameId });
    await playerGame.save();

    res.status(201).json(newGameState);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating room', error });
  }
});

// Join a game as blue
app.post('/game/join', async (req, res) => {
  try {
    const { gameId, playerId, playerColor } = req.body;

    // Fetch the game state by gameId
    let activeGame = await ActiveGameModel.findOne({ gameId });
    if (!activeGame) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if the player slot is already taken
    if (activeGame.gameState.players[playerColor as PlayerColor].id) {
      return res.status(400).json({ message: `${playerColor} player slot is already taken.` });
    }

    // Assign playerId to blue player
    activeGame.gameState.players[playerColor as PlayerColor].id = playerId;

    // Save the updated game state
    await activeGame.save();

    // Associate player with this game
    const playerGame = new PlayerGameModel({ playerId, gameId });
    await playerGame.save();

    res.status(200).json(activeGame.gameState);
  } catch (error) {
    res.status(500).json({ message: 'Error joining room', error });
  }
});

// Leave game that you are in
app.post('/game/leave', async (req, res) => {
  try {
    const { gameId, playerId } = req.body;
    let activeGame = await ActiveGameModel.findOne({ gameId });
    if (!activeGame) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Remove playerId from game state
    if (playerId === activeGame.gameState.players.red.id) {
      activeGame.gameState.players.red.id = '';
    } else if (playerId === activeGame.gameState.players.blue.id) {
      activeGame.gameState.players.blue.id = '';
    } else {
      return res.status(400).json({ message: 'Player is not in this game.' });
    }

    // Save the updated game state
    await activeGame.save();

    // Find and delete the player game entry
    await PlayerGameModel.findOneAndDelete({ playerId, gameId });

    res.status(200).json(activeGame.gameState);
  } catch (error) {
    res.status(500).json({ message: 'Error leaving room', error });
  }
});

// Delete a game
app.delete('/game/delete', async (req, res) => {
  try {
    const { gameId } = req.body;
    const activeGame = await ActiveGameModel.findOne({ gameId });
    if (!activeGame) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Delete the game
    await ActiveGameModel.findOneAndDelete({ gameId });

    // Optionally, delete any related player games if needed
    await PlayerGameModel.deleteMany({ gameId });

    res.status(200).json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room', error });
  }
});


// Update a game's state
app.put('/game/update', async (req, res) => {
  try {
    const { gameId, gameState } = req.body;
    let activeGame = await ActiveGameModel.findOne({ gameId });
    if (!activeGame) {
      return res.status(404).json({ message: 'Room not found' });
    }

    activeGame.gameState = gameState;
    await activeGame.save();

    res.status(200).json(activeGame.gameState);
  } catch (error) {
    res.status(500).json({ message: 'Error updating room', error });
  }
});

// Fetch a game by gameId
app.get('/games/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;

    // Fetch the game state by gameId
    const activeGame = await ActiveGameModel.findOne({ gameId });
    if (!activeGame) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json(activeGame.gameState);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room', error });
  }
});

// Return whether a game exists
app.get('/games/exists/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;

    const activeGame = await ActiveGameModel.findOne({ gameId });
    if (!activeGame) {
      return res.status(200).json({ exists: false });
    }

    res.status(200).json({ exists: true });
  } catch (error) {
    res.status(500).json({ message: 'Error checking game existence', error });
  }
}); 

// Fetch all games
app.get('/games', async (req, res) => {
  try {
    const activeGames = await ActiveGameModel.find();
    const playerGames = await PlayerGameModel.find();

    // Combine the data to map players to their games
    const gameData = {
      activeGames,
      playerGames,
    };

    res.status(200).json(gameData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching games and players', error });
  }
});

// Delete all games
app.delete('/games/deleteAll', async (req, res) => {
  try {
    await ActiveGameModel.deleteMany({});
    await PlayerGameModel.deleteMany({});
    res.status(200).json({ message: 'All games deleted successfully' });
   } catch (error) {
    res.status(500).json({ message: 'Error deleting games and players', error });
  }
});


app.get('/', (req, res) => {
  res.send('Welcome to the Game Server!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
