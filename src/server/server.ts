import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { createNewGameState } from '../GameState';
import ActiveGameModel from './models/ActiveGame'; // Adjust the import path as necessary
import PlayerGameModel from './models/PlayerGame'; // Adjust the import path as necessary

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

// Create a room
app.post('/rooms', async (req, res) => {
  try {
    const { gameId, playerId } = req.body;

    // Check if the game already exists
    let gameState = await ActiveGameModel.findOne({ gameId });
    if (gameState) {
      return res.status(400).json({ message: 'Game already exists with this gameId.' });
    }

    // Create a new game state
    const newGameState = createNewGameState();
    newGameState.players.red.id = playerId;  // Assign playerId to red player

    const newGame = new ActiveGameModel({ gameId: gameId, gameState: newGameState });

    // Save the new game state
    await newGame.save();

    // Associate player with this game
    const playerGame = new PlayerGameModel({ playerId, gameId });
    await playerGame.save();

    res.status(201).json({ message: 'Room created successfully', gameState: newGameState });
  } catch (error) {
    res.status(500).json({ message: 'Error creating room', error });
  }
});

// Join a room by gameId
app.post('/rooms/join', async (req, res) => {
  try {
    const { gameId, playerId } = req.body;

    // Fetch the game state by gameId
    let activeGame = await ActiveGameModel.findOne({ gameId });
    if (!activeGame) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if the blue player slot is already taken
    if (activeGame.gameState.players.blue.id) {
      return res.status(400).json({ message: 'Blue player slot is already taken.' });
    }

    // Assign playerId to blue player
    activeGame.gameState.players.blue.id = playerId;

    // Save the updated game state
    await activeGame.save();

    // Associate player with this game
    const playerGame = new PlayerGameModel({ playerId, gameId });
    await playerGame.save();

    res.status(200).json({ message: 'Joined room successfully', activeGame });
  } catch (error) {
    res.status(500).json({ message: 'Error joining room', error });
  }
});

// Fetch a room by gameId
app.get('/rooms/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;

    // Fetch the game state by gameId
    const gameState = await ActiveGameModel.findOne({ gameId });
    if (!gameState) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json(gameState);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room', error });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the Game Server!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
