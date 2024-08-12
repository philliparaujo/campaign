export type Influence = '' | 'red' | 'blue';

interface Road {
  type: 'road';
}

export interface Floor {
  influence: Influence;
}

interface BuildingCell {
  type: 'building';
  floors: Floor[];
  baseCost: number;
}

export type Cell = Road | BuildingCell;

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
