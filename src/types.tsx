/* Board structure */
export type Board = Cell[][];
export type Cell = Road | BuildingCell;

interface Road {
  type: 'road';
}
interface BuildingCell {
  type: 'building';
  floors: Floor[];
  baseCost: number;
}

export interface Floor {
  influence: Influence;
}
export type Influence = '' | 'red' | 'blue';

/* Game state types */
export type GameState = {
  board: Board;
  redCoins: number;
  blueCoins: number;
  turnNumber: number;
  phaseNumber: number;
  redPublicOpinion: Opinion[];
  redPolls: Poll[];
  bluePolls: Poll[];
  debugMode: boolean;
};

export type Poll = {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  redPercent: number;
};

export type Opinion = {
  redPublicOpinion: number[]; // to keep track of four phases
  trueRedPercent: number | null; // whether poll has come out or not
};

/* Used to update polling boundaries */
export type PollInput = {
  redStartRow: number;
  redStartCol: number;
  redEndRow: number;
  redEndCol: number;
  blueStartRow: number;
  blueStartCol: number;
  blueEndRow: number;
  blueEndCol: number;
};
