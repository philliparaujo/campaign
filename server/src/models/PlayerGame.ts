import mongoose, { Schema } from "mongoose";

// PlayerGame Schema
const playerGameSchema = new Schema({
  playerId: { type: String, required: true, unique: true },
  gameId: { type: String, required: true },
  playerColor: { type: String, required: true },
  displayName: { type: String, required: true },
});

const PlayerGameModel = mongoose.model("PlayerGame", playerGameSchema);

export default PlayerGameModel;
