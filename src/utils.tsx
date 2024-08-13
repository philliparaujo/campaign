import { size } from './GameState';
import {
  Board,
  Floor,
  GameState,
  PlayerAction,
  PlayerColor,
  Poll,
  PollRegion,
} from './types';

// Generate a random number of building floors
const maxFloorHeight = 3;
const randomFloors = (): Floor[] => {
  const height = Math.floor(Math.random() * maxFloorHeight) + 1;
  return Array(height).fill({ influence: '' });
};

// Helper function to check if a 2x2 group forms a square road
const isSquareRoad = (
  board: Board,
  size: number,
  row: number,
  col: number
): boolean => {
  return (
    row < size - 1 &&
    col < size - 1 && // Ensure within bounds
    board[row][col].type === 'road' &&
    board[row][col + 1].type === 'road' &&
    board[row + 1][col].type === 'road' &&
    board[row + 1][col + 1].type === 'road'
  );
};

// Calculate the cost of the lowest floor of a building
const calculateBaseCost = (row: number, col: number): number => {
  const middle = (size - 1) / 2;
  const distance = Math.abs(middle - row) + Math.abs(middle - col);
  return size - distance;
};

// Generate a city board
const maxRoadsAllowed = 15;
export const initializeBoard = (size: number): Board => {
  // Step 1: Initialize the board with all roads
  const board: Board = Array(size)
    .fill(null)
    .map(() =>
      Array(size)
        .fill(null)
        .map(() => ({
          type: 'road',
        }))
    );

  let roadCount = size * size;

  // Step 2: Repeat until no square roads remain
  let squareRoadExists = true;

  while (squareRoadExists) {
    const squareRoadCells = [];

    // Identify all cells that are part of a 2x2 square road
    for (let row = 0; row < size - 1; row++) {
      for (let col = 0; col < size - 1; col++) {
        if (isSquareRoad(board, size, row, col)) {
          squareRoadCells.push({ row, col });
        }
      }
    }

    // If no square roads are left, stop the process
    if (squareRoadCells.length === 0) {
      squareRoadExists = false;
    } else {
      // Randomly pick one of the square road cells
      const { row, col } =
        squareRoadCells[Math.floor(Math.random() * squareRoadCells.length)];

      // Turn one of the cells in the 2x2 group into a building
      const cellToConvert = Math.floor(Math.random() * 4);
      switch (cellToConvert) {
        case 0:
          board[row][col] = {
            type: 'building',
            floors: randomFloors(),
            baseCost: calculateBaseCost(row, col),
          };
          break;
        case 1:
          board[row][col + 1] = {
            type: 'building',
            floors: randomFloors(),
            baseCost: calculateBaseCost(row, col + 1),
          };
          break;
        case 2:
          board[row + 1][col] = {
            type: 'building',
            floors: randomFloors(),
            baseCost: calculateBaseCost(row + 1, col),
          };
          break;
        case 3:
          board[row + 1][col + 1] = {
            type: 'building',
            floors: randomFloors(),
            baseCost: calculateBaseCost(row + 1, col + 1),
          };
          break;
      }
      roadCount--;
    }
  }

  while (roadCount > maxRoadsAllowed) {
    let currentRoadCount = 0;
    let randomRoadIndex = Math.floor(Math.random() * roadCount);

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col].type === 'road') {
          if (currentRoadCount === randomRoadIndex) {
            // Turn the selected road into a building
            board[row][col] = {
              type: 'building',
              floors: randomFloors(),
              baseCost: calculateBaseCost(row, col),
            };
            roadCount--;
            break;
          }
          currentRoadCount++;
        }
      }
      if (currentRoadCount > randomRoadIndex) break;
    }
  }

  return board;
};

// Turn recent polling results and accusations into public opinion score
export const calculatePublicOpinion = (
  redPolls: Poll[],
  bluePolls: Poll[],
  currentTurn: number
): number => {
  const previousTurn = Math.max(currentTurn - 1, 0);

  const prevRedPoll = redPolls[previousTurn]['redPercent'];
  const prevBluePoll = bluePolls[previousTurn]['redPercent'];
  const currentRedPoll = redPolls[currentTurn]['redPercent'];
  const currentBluePoll = bluePolls[currentTurn]['redPercent'];

  return (prevRedPoll + prevBluePoll + currentRedPoll + currentBluePoll) / 4;
};

// Turns polling percentage into color-coded final result
export const formatPoll = (redPercent: number) => {
  return (
    <p
      style={{
        color: redPercent >= 0.5 ? 'red' : 'blue',
        marginBottom: '10px',
      }}
    >
      {redPercent >= 0.5 ? 'Red +' : 'Blue +'}
      {(Math.abs(redPercent - (1 - redPercent)) * 100).toFixed(1)}%
    </p>
  );
};

// Helper function to calculate the influence for one cell in one direction
const calculateDirectionalInfluence = (
  board: Board,
  startRow: number,
  startCol: number,
  rowDelta: number,
  colDelta: number,
  influenceType: PlayerColor
): number => {
  let influence = 0;
  let distance = 1;
  const size = board.length;
  let lowestVisibleFloor = 0; // Start with the smallest possible value for height

  let row = startRow + rowDelta;
  let col = startCol + colDelta;

  while (row >= 0 && row < size && col >= 0 && col < size) {
    const cell = board[row][col];

    if (cell.type === 'building') {
      const buildingHeight = cell.floors.length;

      // Iterate over the floors of the building from the ground up
      for (
        let floorIndex = buildingHeight - lowestVisibleFloor - 1;
        floorIndex >= 0;
        floorIndex--
      ) {
        const floor = cell.floors[floorIndex];
        if (floor.influence === influenceType) {
          influence += size - distance;
        }
      }

      // Update minHeightSeen to the smallest floor index encountered
      lowestVisibleFloor = Math.max(lowestVisibleFloor, buildingHeight);
    }

    distance++;
    row += rowDelta;
    col += colDelta;
  }

  return influence;
};

// Helper function to calculate the influence for one cell in all directions
const startingInfluence = 1;
const diagonalMultiplier = 0.5;
export const calculateRoadInfluence = (
  influenceType: PlayerColor,
  board: Board,
  row: number,
  col: number
): number => {
  const cell = board[row][col];
  if (cell.type !== 'road') return 0;

  const straightDirections = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
  let straightInfluences = 0;
  for (const [rowDelta, colDelta] of straightDirections) {
    straightInfluences += calculateDirectionalInfluence(
      board,
      row,
      col,
      rowDelta,
      colDelta,
      influenceType
    );
  }

  const diagonalDirections = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  let diagonalInfluences = 0;
  for (const [rowDelta, colDelta] of diagonalDirections) {
    diagonalInfluences += calculateDirectionalInfluence(
      board,
      row,
      col,
      rowDelta,
      colDelta,
      influenceType
    );
  }

  return (
    startingInfluence +
    straightInfluences +
    diagonalInfluences * diagonalMultiplier
  );
};

// Helper function to calculate the total influence for all cells
export const calculateTotalInfluence = (
  influenceType: PlayerColor,
  board: Board
): number => {
  let totalInfluence = 0;
  const size = board.length;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      totalInfluence += calculateRoadInfluence(influenceType, board, row, col);
    }
  }

  return totalInfluence;
};

export const calculatePercentInfluence = (
  redInfluence: number,
  blueInfluence: number
): number => {
  const totalInfluence = redInfluence + blueInfluence;
  if (totalInfluence <= 0) {
    return 0.5;
  }
  return redInfluence / totalInfluence;
};

// Calculate cell influences on our board and turn into voting percentages
const createPercentArray = (board: Board): (number | null)[][] => {
  const size = board.length;
  const percentArray: (number | null)[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(null));

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col].type === 'road') {
        const redInfluence = calculateRoadInfluence('red', board, row, col);
        const blueInfluence = calculateRoadInfluence('blue', board, row, col);
        const percentInfluence = calculatePercentInfluence(
          redInfluence,
          blueInfluence
        );

        if (percentInfluence > 0) {
          percentArray[row][col] = percentInfluence;
        }
      }
    }
  }

  return percentArray;
};

/* Sample from a binomial distribution
   p = percent chance to vote for red, n = number of voters */
const sample = (p: number, n: number): number => {
  let headsCount = 0;
  for (let i = 0; i < n; i++) {
    if (Math.random() < p) {
      headsCount++;
    }
  }
  return headsCount / n;
};

// Conduct a poll within poll boundary and return percentage of red votes
const sampleSize = 40;
export const getRedSample = (
  board: Board,
  pollRegion: PollRegion = {
    startRow: 0,
    endRow: size - 1,
    startCol: 0,
    endCol: size - 1,
  },
  trueSample: boolean = false
): number => {
  const { startRow, endRow, startCol, endCol } = pollRegion;

  const percentArray = createPercentArray(board);
  let totalRedPercentage = 0;
  let roadCount = 0;

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const percent = percentArray[row][col];
      if (percent !== null) {
        totalRedPercentage += trueSample
          ? percent
          : sample(percent, sampleSize);
        roadCount++;
      }
    }
  }

  return roadCount > 0 ? totalRedPercentage / roadCount : 0.5;
};

// Logic for toggling ability of next phase button
export const canEndPhase = (gameState: GameState): boolean => {
  const { phaseNumber, phaseActions, redCoins, blueCoins } = gameState;

  const coinCheck = redCoins >= 0 && blueCoins >= 0;

  switch (phaseNumber) {
    case 1:
      return coinCheck;
    case 2:
      return (
        phaseActions['red'] === 'conductPoll' &&
        phaseActions['blue'] === 'conductPoll' &&
        coinCheck
      );
    case 3:
      const factCheckOptions: PlayerAction[] = ['trust', 'doubt', 'accuse'];
      return (
        factCheckOptions.includes(phaseActions['red']) &&
        factCheckOptions.includes(phaseActions['blue']) &&
        coinCheck
      );
    case 4:
      return coinCheck;
    default:
      return false;
  }
};

/* If poll within 5% of true value, lose 5% public opinion;
   otherwise, gain 5% public opinion. */
const doubtPercent = 0.025;
const doubtPenalty = 0.025;
export const handleDoubtPoll = (
  playerColor: PlayerColor,
  gameState: GameState
): number => {
  const { board, turnNumber, redPolls, bluePolls } = gameState;

  let truePercent = getRedSample(board, undefined, true);
  let poll =
    playerColor === 'red' ? bluePolls[turnNumber] : redPolls[turnNumber];
  let pollPercent = poll['redPercent'];

  if (Math.abs(pollPercent - truePercent) < doubtPercent) {
    return playerColor === 'red' ? -doubtPenalty : doubtPenalty;
  } else {
    return playerColor === 'red' ? doubtPenalty : -doubtPenalty;
  }
};

/* If poll within 10% of true value, lose 10% public opinion;
   otherwise, their poll gets thrown out (or gain 10% public opinion). */
const accusePercent = 0.05;
const accusePenalty = 0.05;
export const handleAccusePoll = (
  playerColor: PlayerColor,
  gameState: GameState
): number => {
  const { board, turnNumber, redPolls, bluePolls } = gameState;

  let truePercent = getRedSample(board, undefined, true);
  let poll =
    playerColor === 'red' ? bluePolls[turnNumber] : redPolls[turnNumber];
  let pollPercent = poll['redPercent'];

  if (Math.abs(pollPercent - truePercent) < accusePercent) {
    return playerColor === 'red' ? -accusePenalty : accusePenalty;
  } else {
    return playerColor === 'red' ? accusePenalty : -accusePenalty;
  }
};
