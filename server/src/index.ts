import dotenv from "dotenv";
import express from "express";
import http from "http";
import mongoose, { Error } from "mongoose";
import { PlayerColor } from "shared/types";
import { createNewGameState, opponentOf } from "shared/utils";
import { Server as SocketIOServer } from "socket.io";
import ActiveGameModel from "./models/ActiveGame";
import PlayerGameModel from "./models/PlayerGame";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  path: "/api/v1/socket",
});

const buildTime = new Date().toUTCString();
process.env.BUILD_TIME = buildTime;

// Connect to MongoDB Atlas
const URI = process.env.MONGODB_URI;
if (!URI) {
  throw new Error("MONGODB_URI is not defined in the environment variables.");
}

mongoose
  .connect(URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

async function handleSocketEvent<T>(
  socket: any,
  query: () => Promise<T | null>,
  successCallback: (result: T | null) => void,
  errorMessage: string,
) {
  try {
    const result = await query();
    if (result === null) {
      return socket.emit("error", { message: errorMessage });
    }
    successCallback(result);
  } catch (error: any) {
    socket.emit("error", { message: errorMessage, error });
  }
}

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("get-server-build-time", () => {
    socket.emit("server-build-time", process.env.BUILD_TIME || "Unknown");
  });

  // Create a game and join it
  socket.on("game/create", ({ gameId, playerId, playerColor, displayName }) => {
    handleSocketEvent(
      socket,
      async () => {
        // Check if game already exists or player already in game
        let activeGame = await ActiveGameModel.findOne({ gameId });
        let playerGame = await PlayerGameModel.findOne({ playerId });
        if (activeGame || playerGame) return null;

        // Set player color in new game state
        const gameState = createNewGameState();
        gameState.players[playerColor as PlayerColor].id = playerId;

        // Create and save new game models, store them in database
        activeGame = new ActiveGameModel({
          gameId,
          gameState,
        });
        playerGame = new PlayerGameModel({
          playerId,
          gameId,
          playerColor,
          displayName,
        });

        await activeGame.save();
        await playerGame.save();

        return gameState;
      },
      (gameState) => {
        socket.join(gameId);
        io.to(gameId).emit("gameCreated", {
          gameState,
          gameId,
          playerColor,
          displayName,
        });
      },
      "Error creating game",
    );
  });

  // Join a game
  socket.on("game/join", ({ gameId, playerId, playerColor, displayName }) => {
    handleSocketEvent(
      socket,
      async () => {
        // Check if game exists and player is not already in game
        let activeGame = await ActiveGameModel.findOne({ gameId });
        let playerGame = await PlayerGameModel.findOne({ playerId });
        if (!activeGame || playerGame) return null;

        // Check if color is already taken
        if (activeGame.gameState.players[playerColor as PlayerColor].id) {
          return null;
        }

        // Save new game models
        activeGame.gameState.players[playerColor as PlayerColor].id = playerId;
        playerGame = new PlayerGameModel({
          playerId,
          gameId,
          playerColor,
          displayName,
        });

        await activeGame.save();
        await playerGame.save();

        return activeGame.gameState;
      },
      (gameState) => {
        socket.join(gameId);
        io.to(gameId).emit("gameJoined", {
          gameState,
          gameId,
          playerColor,
          displayName,
        });
      },
      "Error joining game",
    );
  });

  // Reconnect
  socket.on(
    "game/reconnect",
    ({ gameId, playerId, playerColor, displayName }) => {
      handleSocketEvent(
        socket,
        async () => {
          // Check if game exists and player is in game
          let activeGame = await ActiveGameModel.findOne({ gameId });
          let playerGame = await PlayerGameModel.findOne({ playerId, gameId });
          if (!activeGame || !playerGame) return null;

          // Ensure that color matches
          if (
            playerId !==
            activeGame.gameState.players[playerColor as PlayerColor].id
          ) {
            return null;
          }

          // Ensure that display name matches
          if (displayName !== playerGame.displayName) {
            return null;
          }

          return activeGame.gameState;
        },
        (gameState) => {
          socket.join(gameId);
        },
        "Error reconnecting to game",
      );
    },
  );

  // Leave a game
  socket.on("game/leave", ({ gameId, playerId }) => {
    handleSocketEvent(
      socket,
      async () => {
        // Check if game exists and player is in game
        let activeGame = await ActiveGameModel.findOne({ gameId });
        let playerGame = await PlayerGameModel.findOne({ playerId, gameId });
        if (!activeGame || !playerGame) return null;

        // Remove playerId from game state
        if (playerId === activeGame.gameState.players.red.id) {
          activeGame.gameState.players.red.id = "";
        } else if (playerId === activeGame.gameState.players.blue.id) {
          activeGame.gameState.players.blue.id = "";
        } else {
          return null;
        }

        // Save new game models
        await activeGame.save();
        await PlayerGameModel.findOneAndDelete({ playerId, gameId });

        return activeGame.gameState;
      },
      (gameState) => {
        const gameData = { gameState, playerId };
        io.to(gameId).emit("gameLeft", gameData);
        socket.leave(gameId);
      },
      "Error leaving game",
    );
  });

  // Delete a game
  socket.on("game/delete", ({ gameId }) => {
    handleSocketEvent(
      socket,
      async () => {
        // Check if game exists
        let activeGame = await ActiveGameModel.findOne({ gameId });
        if (!activeGame) return null;

        // Delete the game
        await ActiveGameModel.findOneAndDelete({ gameId });
        await PlayerGameModel.deleteMany({ gameId });

        return;
      },
      () => {
        io.to(gameId).emit("gameDeleted", {
          message: "Game deleted successfully",
        });
      },
      "Error deleting game",
    );
  });

  // Update a game's state
  socket.on("game/update", ({ gameId, gameState }) => {
    handleSocketEvent(
      socket,
      async () => {
        // Check if game exists
        let activeGame = await ActiveGameModel.findOne({ gameId });
        if (!activeGame) return null;

        // Update and save the game state
        activeGame.gameState = gameState;
        await activeGame.save();

        return activeGame.gameState;
      },
      (gameState) => {
        io.to(gameId).emit("gameUpdated", gameState);
      },
      "Error updating game",
    );
  });

  // Fetch a game by gameId
  socket.on("games/fetch", ({ gameId }) => {
    handleSocketEvent(
      socket,
      async () => {
        // Check if game exists
        let activeGame = await ActiveGameModel.findOne({ gameId });
        if (!activeGame) return null;

        return activeGame.gameState;
      },
      (gameState) => {
        socket.emit("gameFetched", gameState);
      },
      "Error fetching game",
    );
  });

  // Fetch a player by playerId
  socket.on("players/fetch", ({ playerId }) => {
    handleSocketEvent(
      socket,
      async () => {
        // Check if player exists
        let playerGame = await PlayerGameModel.findOne({ playerId });
        if (!playerGame) return null;

        return playerGame;
      },
      (playerGame) => {
        socket.emit("playerFetched", playerGame);
      },
      "Error fetching player",
    );
  });

  // Fetch an opponent of playerId
  socket.on("players/fetchOpponent", ({ playerId }) => {
    handleSocketEvent(
      socket,
      async () => {
        // Check if player exists
        let playerGame = await PlayerGameModel.findOne({ playerId });
        if (!playerGame) return null;

        // Find the opponent's game
        const opponentGame = await PlayerGameModel.findOne({
          gameId: playerGame.gameId,
          playerColor: opponentOf(playerGame.playerColor as PlayerColor),
        });
        if (!opponentGame) return { opponentGame: null };

        return { opponentGame: opponentGame };
      },
      (opponentGameData) => {
        if (opponentGameData?.opponentGame) {
          socket.emit("opponentFetched", opponentGameData.opponentGame);
        } else {
          socket.emit("opponentNotFound");
        }
      },
      "Error fetching opponent",
    );
  });

  // Return whether a game exists
  socket.on("games/exists", ({ gameId }) => {
    handleSocketEvent(
      socket,
      async () => {
        let activeGame = await ActiveGameModel.findOne({ gameId });
        return !!activeGame;
      },
      (exists) => {
        socket.emit("gameExists", { exists });
      },
      "Error checking game existence",
    );
  });

  // Return whether a player is in a game
  socket.on("players/inGame", ({ playerId }) => {
    handleSocketEvent(
      socket,
      async () => {
        const playerGame = await PlayerGameModel.findOne({ playerId });
        return !!playerGame && playerGame.gameId !== "";
      },
      (inGame) => {
        socket.emit("playerInGame", { inGame });
      },
      "Error checking player in game",
    );
  });

  // Fetch all games
  socket.on("games/fetchAll", () => {
    handleSocketEvent(
      socket,
      async () => {
        const activeGames = await ActiveGameModel.find();
        const playerGames = await PlayerGameModel.find();

        return {
          activeGames,
          playerGames,
        };
      },
      (gameData) => {
        socket.emit("allGamesFetched", gameData);
      },
      "Error fetching games and players",
    );
  });

  // Delete all games
  socket.on("games/deleteAll", () => {
    handleSocketEvent(
      socket,
      async () => {
        await ActiveGameModel.deleteMany({});
        await PlayerGameModel.deleteMany({});
        return;
      },
      () => {
        io.emit("allGamesDeleted", {
          message: "All games deleted successfully",
        });
      },
      "Error deleting games and players",
    );
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.get("/api/v1/version", (req, res) => {
  res.send({ version: process.env.BUILD_TIME || "Unknown" });
  console.log("i received a request");
});

server.listen(port, () => {
  console.log(`Server running on port ${port}, build time: ${process.env.BUILD_TIME || "Unknown"}.`);
});
