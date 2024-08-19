import mongoose, { Schema } from "mongoose";
import { startingCoins } from "../shared/GameState";

// Define schemas for nested structures
const playerSchema = new Schema({
  // id/phaseAction are not required because mongoose treats '' as not provided
  id: { type: String, default: "" },
  coins: { type: Number, default: startingCoins, required: true },
  phaseAction: { type: String, default: "" },
  pollHistory: { type: Array, default: [], required: true },
});

const playersSchema = new Schema({
  red: { type: playerSchema, required: true },
  blue: { type: playerSchema, required: true },
});

const gameStateSchema = new Schema({
  board: { type: Array, default: [] },
  turnNumber: { type: Number, default: 1 },
  phaseNumber: { type: Number, default: 1 },
  publicOpinionHistory: { type: Array, default: [] },
  players: {
    type: playersSchema,
    required: true,
  },
});

const activeGameSchema = new Schema({
  gameId: { type: String, required: true, unique: true },
  gameState: { type: gameStateSchema, required: true },
});

// Create the model from the schema
const ActiveGameModel = mongoose.model("ActiveGame", activeGameSchema);

export default ActiveGameModel;
