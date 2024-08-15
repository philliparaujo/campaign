import mongoose, { Schema } from 'mongoose';
import { createNewGameState } from '../../GameState';

// Define schemas for nested structures

const pollRegionSchema = new Schema({
  startRow: { type: Number, required: true },
  endRow: { type: Number, required: true },
  startCol: { type: Number, required: true },
  endCol: { type: Number, required: true },
});

const pollSchema = new Schema({
  ...pollRegionSchema.obj,
  redPercent: { type: Number, required: true },
});

const playerInfoSchema = new Schema({
  id: { type: String, required: true },
  coins: { type: Number, required: true },
  phaseAction: { type: String, required: true },
  pollHistory: [pollSchema],  // Array of Polls
});

const opinionSchema = new Schema({
  redPublicOpinion: [{ type: Number, required: true }],  // Array of Numbers
  trueRedPercent: { type: Number, default: null },  // Number or null
});

const floorSchema = new Schema({
  influence: { type: String, enum: ['', 'red', 'blue'], required: true },
});

const cellSchema = new Schema({
  type: { type: String, enum: ['road', 'building'], required: true },
  floors: [floorSchema],  // Array of Floors
  baseCost: { type: Number },  // Only relevant for BuildingCell
});

const gameStateSchema = new mongoose.Schema({
  gameState: {
    board: { type: Array, default: [] },
    turnNumber: { type: Number, default: 1 },
    phaseNumber: { type: Number, default: 1 },
    publicOpinionHistory: { type: Array, default: [] },
    debugMode: { type: Boolean, default: false },
    players: {
      red: {
        id: { type: String, default: '' },
        coins: { type: Number, default: 10 },
        phaseAction: { type: String, default: '' },
        pollHistory: { type: Array, default: [] },
      },
      blue: {
        id: { type: String, default: '' },
        coins: { type: Number, default: 10 },
        phaseAction: { type: String, default: '' },
        pollHistory: { type: Array, default: [] },
      },
    },
  },
});

const activeGameSchema = new Schema({
  gameId: { type: String, required: true, unique: true },
  gameState: gameStateSchema,
});

// Create the model from the schema
const ActiveGameModel = mongoose.model('ActiveGame', activeGameSchema);

export default ActiveGameModel;
