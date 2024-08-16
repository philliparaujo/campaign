import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose, { Error } from 'mongoose';
import { createNewGameState } from '../GameState';
import ActiveGameModel from './models/ActiveGame';
import PlayerGameModel from './models/PlayerGame';
import { PlayerColor } from '../types';
import { opponentOf } from '../utils';
import http from 'http';
import {Server as SocketIOServer} from 'socket.io';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB Atlas
const URI = process.env.MONGODB_URI;
if (!URI) {
  throw new Error('MONGODB_URI is not defined in the environment variables.');
}

mongoose.connect(URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

io.on('connection', socket => {
  console.log('A user connected');

  // Create a game and join it
  socket.on('game/create', async ({gameId, playerId, playerColor}) => {
    try {
      // Check if the game already exists
      let gameState = await ActiveGameModel.findOne({ gameId });
      if (gameState) {
        return socket.emit('error', { message: 'Game already exists with this gameId.' });
      }

      // Check if player is already associated with a game
      let playerGame = await PlayerGameModel.findOne({ playerId });
      if (playerGame) {
        return socket.emit('error', { message: 'Player is already associated with a game.' });
      }

      // Create a new game state
      const newGameState = createNewGameState();
      newGameState.players[playerColor as PlayerColor].id = playerId;

      const newGame = new ActiveGameModel({ gameId: gameId, gameState: newGameState });
      await newGame.save();

      // Associate player with this game
      playerGame = new PlayerGameModel({ playerId, gameId, playerColor });
      await playerGame.save();

      // Emit the new game state to the client
      socket.emit('gameCreated', newGameState);
    } catch (error: any) {
      socket.emit('error', { message: 'Error creating room', error });
    }
  });

  // Join a game
  socket.on('game/join', async ({ gameId, playerId, playerColor }) => {
    try {
      // Fetch the game state by gameId
      let activeGame = await ActiveGameModel.findOne({ gameId });
      if (!activeGame) {
        return socket.emit('error', { message: 'Room not found' });
      }

      // Check if the player slot is already taken
      if (activeGame.gameState.players[playerColor as PlayerColor].id) {
        return socket.emit('error', { message: `${playerColor} player slot is already taken.` });
      }

      // Assign playerId to the selected player color
      activeGame.gameState.players[playerColor as PlayerColor].id = playerId;

      // Save the updated game state
      await activeGame.save();

      // Associate player with this game
      const playerGame = new PlayerGameModel({ playerId, gameId, playerColor });
      await playerGame.save();

      // Emit the updated game state to the client
      socket.emit('gameJoined', activeGame.gameState);
    } catch (error: any) {
      socket.emit('error', { message: 'Error joining room', error });
    }
  });

  // Leave game
  socket.on('game/leave', async ({ gameId, playerId }) => {
    try {
      let activeGame = await ActiveGameModel.findOne({ gameId });
      if (!activeGame) {
        return socket.emit('error', { message: 'Room not found' });
      }

      // Remove playerId from game state
      if (playerId === activeGame.gameState.players.red.id) {
        activeGame.gameState.players.red.id = '';
      } else if (playerId === activeGame.gameState.players.blue.id) {
        activeGame.gameState.players.blue.id = '';
      } else {
        return socket.emit('error', { message: 'Player is not in this game.' });
      }

      // Save the updated game state
      await activeGame.save();

      // Find and delete the player game entry
      await PlayerGameModel.findOneAndDelete({ playerId, gameId });

      socket.emit('gameLeft', activeGame.gameState);
    } catch (error: any) {
      socket.emit('error', { message: 'Error leaving room', error });
    }
  });

  // Delete a game
  socket.on('game/delete', async ({ gameId }) => {
    try {
      const activeGame = await ActiveGameModel.findOne({ gameId });
      if (!activeGame) {
        return socket.emit('error', { message: 'Room not found' });
      }

      // Delete the game
      await ActiveGameModel.findOneAndDelete({ gameId });

      // Optionally, delete any related player games if needed
      await PlayerGameModel.deleteMany({ gameId });

      socket.emit('gameDeleted', { message: 'Game deleted successfully' });
    } catch (error: any) {
      socket.emit('error', { message: 'Error deleting room', error });
    }
  });

  // Update a game's state
  socket.on('game/update', async ({ gameId, gameState }) => {
    try {
      let activeGame = await ActiveGameModel.findOne({ gameId });
      if (!activeGame) {
        return socket.emit('error', { message: 'Room not found' });
      }

      activeGame.gameState = gameState;
      await activeGame.save();

      socket.emit('gameUpdated', activeGame.gameState);
    } catch (error: any) {
      socket.emit('error', { message: 'Error updating room', error });
    }
  });

  // Fetch a game by gameId
  socket.on('games/fetch', async ({ gameId }) => {
    try {
      const activeGame = await ActiveGameModel.findOne({ gameId });
      if (!activeGame) {
        return socket.emit('error', { message: 'Room not found' });
      }

      socket.emit('gameFetched', activeGame.gameState);
    } catch (error: any) {
      socket.emit('error', { message: 'Error fetching room', error });
    }
  });

  // Fetch a player by playerId
  socket.on('players/fetch', async ({ playerId }) => {
    try {
      const playerGame = await PlayerGameModel.findOne({ playerId });
      if (!playerGame) {
        return socket.emit('error', { message: 'Player not found' });
      }

      socket.emit('playerFetched', playerGame);
    } catch (error: any) {
      socket.emit('error', { message: 'Error fetching player', error });
    }
  });

  // Fetch an opponent of playerId
  socket.on('players/fetchOpponent', async ({ playerId }) => {
    try {
      const playerGame = await PlayerGameModel.findOne({ playerId });
      if (!playerGame) {
        return socket.emit('error', { message: 'Player not found' });
      }

      // Find the opponent's game
      const opponentGame = await PlayerGameModel.findOne({
        gameId: playerGame.gameId,
        playerColor: opponentOf(playerGame.playerColor as PlayerColor),
      });

      if (!opponentGame) {
        return socket.emit('opponentNotFound'); // No Content
      }

      socket.emit('opponentFetched', opponentGame);
    } catch (error: any) {
      socket.emit('error', { message: 'Error fetching opponent', error });
    }
  });

  // Return whether a game exists
  socket.on('games/exists', async ({ gameId }) => {
    try {
      const activeGame = await ActiveGameModel.findOne({ gameId });
      const exists = !!activeGame;
      socket.emit('gameExists', { exists });
    } catch (error: any) {
      socket.emit('error', { message: 'Error checking game existence', error });
    }
  });

  // Fetch all games
  socket.on('games/fetchAll', async () => {
    try {
      const activeGames = await ActiveGameModel.find();
      const playerGames = await PlayerGameModel.find();

      // Combine the data to map players to their games
      const gameData = {
        activeGames,
        playerGames,
      };

      socket.emit('allGamesFetched', gameData);
    } catch (error: any) {
      socket.emit('error', { message: 'Error fetching games and players', error });
    }
  });

  // Delete all games
  socket.on('games/deleteAll', async () => {
    try {
      await ActiveGameModel.deleteMany({});
      await PlayerGameModel.deleteMany({});
      socket.emit('allGamesDeleted', { message: 'All games deleted successfully' });
    } catch (error: any) {
      socket.emit('error', { message: 'Error deleting games and players', error });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
