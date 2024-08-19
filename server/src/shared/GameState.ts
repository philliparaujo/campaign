import { GameState, PlayerInfo } from "./types";
import { initializeBoard } from "./utils";

export const size = 5;
export const maxRoadsAllowed = 15; // ~ 3*size is best

export const startingCoins = 10;
export const maxTurns = 3;

const initialPlayer: PlayerInfo = {
  id: "",
  coins: startingCoins,
  factCheck: "",
  phaseAction: "",
  pollHistory: [
    {
      startRow: 0,
      endRow: size - 1,
      startCol: 0,
      endCol: size - 1,
      redPercent: 0.5,
    },
  ],
};

export const createNewGameState = (): GameState => ({
  board: initializeBoard(size),
  turnNumber: 1,
  phaseNumber: 1,
  publicOpinionHistory: [
    { redPublicOpinion: [0.5, 0.5, 0.5, 0.5], trueRedPercent: 0.5 },
    { redPublicOpinion: [0.5, 0.5, 0.5, 0.5], trueRedPercent: null },
  ],
  players: {
    red: { ...initialPlayer },
    blue: { ...initialPlayer },
  },
});
