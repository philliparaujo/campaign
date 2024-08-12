import { Cell, Floor } from './components/Board';
import { Poll } from './GameState';

const maxFloorHeight = 3;
const maxRoadsAllowed = 15;

const randomFloors = (): Floor[] => {
  const height = Math.floor(Math.random() * maxFloorHeight) + 1;
  return Array(height).fill({ influence: '' });
};

// Helper function to check if a 2x2 group forms a square road
const isSquareRoad = (
  board: Cell[][],
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

const calculateBaseCost = (size: number, row: number, col: number): number => {
  const middle = (size - 1) / 2;
  const distance = Math.abs(middle - row) + Math.abs(middle - col);
  return size - distance;
};

export const initializeBoard = (size: number): Cell[][] => {
  // Step 1: Initialize the board with all roads
  const board: Cell[][] = Array(size)
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
            baseCost: calculateBaseCost(size, row, col),
          };
          break;
        case 1:
          board[row][col + 1] = {
            type: 'building',
            floors: randomFloors(),
            baseCost: calculateBaseCost(size, row, col + 1),
          };
          break;
        case 2:
          board[row + 1][col] = {
            type: 'building',
            floors: randomFloors(),
            baseCost: calculateBaseCost(size, row + 1, col),
          };
          break;
        case 3:
          board[row + 1][col + 1] = {
            type: 'building',
            floors: randomFloors(),
            baseCost: calculateBaseCost(size, row + 1, col + 1),
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
              baseCost: calculateBaseCost(size, row, col),
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

export const removeInfluence = (board: Cell[][]): Cell[][] => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const cell = board[row][col];

      if (cell.type === 'building') {
        cell.floors.forEach(floor => {
          floor.influence = '';
        });
      }
    }
  }
  return board;
};

export const calculatePublicOpinion = (
  redPolls: Poll[],
  bluePolls: Poll[],
  currentTurn: number,
  redAccused: boolean = false,
  blueAccused: boolean = false
): number => {
  const previousTurn = Math.max(currentTurn - 1, 0);

  const prevRedPoll = redPolls[previousTurn]['redPercent'];
  const prevBluePoll = bluePolls[previousTurn]['redPercent'];
  const currentRedPoll = redAccused ? 0 : redPolls[currentTurn]['redPercent'];
  const currentBluePoll = blueAccused
    ? 0
    : bluePolls[currentTurn]['redPercent'];

  const numberPolls = 4 - (redAccused ? 1 : 0) - (blueAccused ? 1 : 0);
  return (
    (prevRedPoll + prevBluePoll + currentRedPoll + currentBluePoll) /
    numberPolls
  );
};
