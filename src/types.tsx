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

export type PlayerAction =
  | ''
  | 'done'
  | 'conductPoll'
  | 'trust'
  | 'doubt'
  | 'accuse';

/* Game state types */
export type GameState = {
  board: Board;
  turnNumber: number;
  phaseNumber: number;
  publicOpinionHistory: Opinion[];
  debugMode: boolean;
  players: Record<PlayerColor, PlayerInfo>;
};

export type PlayerInfo = {
  id: PlayerId;
  coins: number;
  phaseAction: PlayerAction;
  pollHistory: Poll[];
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

/* Multiplayer types */
export type GameId = string | '';
export type PlayerId = string | '';

export type PlayerGame = {
  gameId: GameId;
  playerColor: PlayerColor;
  displayName: string;
};
export type PlayerGames = Record<PlayerId, PlayerGame>;
export type ActiveGames = Record<GameId, GameState>;
