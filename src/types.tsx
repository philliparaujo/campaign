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
export type Influence = '' | PlayerColor;
export type PlayerColor = 'red' | 'blue';

export type PlayerAction = '' | 'conductPoll' | 'trust' | 'doubt' | 'accuse';

/* Game state types */
export type GameState = {
  board: Board;
  redCoins: number;
  blueCoins: number;
  turnNumber: number;
  phaseNumber: number;
  // maps every player to what actions they've taken, if any
  phaseActions: Record<PlayerColor, PlayerAction>;
  redPublicOpinion: Opinion[];
  redPolls: Poll[];
  bluePolls: Poll[];
  debugMode: boolean;
};

export type Poll = PollRegion & {
  redPercent: number;
};

export type PollRegion = {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
};

export type Opinion = {
  redPublicOpinion: number[]; // to keep track of four phases
  trueRedPercent: number | null; // whether poll has come out or not
};
