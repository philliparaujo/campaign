import React, { useState } from 'react';
import { useGameState } from '../GameState';
import { Cell } from './Board';

interface ScoreboardProps {}

// Helper function to calculate the influence for one cell in one direction
const calculateDirectionalInfluence = (
  board: Cell[][],
  startRow: number,
  startCol: number,
  rowDelta: number,
  colDelta: number,
  influenceType: 'red' | 'blue'
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
const calculateRoadInfluence = (
  influenceType: 'red' | 'blue',
  board: Cell[][],
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

  return straightInfluences + diagonalInfluences / 2;
};

// Helper function to calculate the total influence for all cells
const calculateTotalInfluence = (
  influenceType: 'red' | 'blue',
  board: Cell[][]
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

const createPercentArray = (board: Cell[][]): (number | null)[][] => {
  const size = board.length;
  const percentArray: (number | null)[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(null));

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col].type === 'road') {
        const redInfluence = calculateRoadInfluence('red', board, row, col);
        const blueInfluence = calculateRoadInfluence('blue', board, row, col);
        const totalInfluence = redInfluence + blueInfluence;

        if (totalInfluence > 0) {
          percentArray[row][col] = redInfluence / totalInfluence;
        }
      }
    }
  }

  return percentArray;
};

// p = percent chance to vote for red, n = number of voters
const sample = (p: number, n: number): number => {
  let headsCount = 0;
  for (let i = 0; i < n; i++) {
    if (Math.random() < p) {
      headsCount++;
    }
  }
  return headsCount / n;
};

export const getRedSample = (
  board: Cell[][],
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number
): number => {
  const percentArray = createPercentArray(board);
  let totalRedPercentage = 0;
  let roadCount = 0;

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const percent = percentArray[row][col];
      if (percent !== null) {
        totalRedPercentage += sample(percent, 20);
        roadCount++;
      }
    }
  }

  const averageRedPercentage =
    roadCount > 0 ? totalRedPercentage / roadCount : 0.5;
  const redPercent = averageRedPercentage * 100;

  return redPercent;
};

const Scoreboard: React.FC<ScoreboardProps> = () => {
  const { gameState } = useGameState();
  const { board } = gameState;
  const [showStats, setShowStats] = useState<boolean>(true);

  let redInfluence = calculateTotalInfluence('red', board);
  let blueInfluence = calculateTotalInfluence('blue', board);

  const size = board.length;
  const redPercent = getRedSample(board, 0, size - 1, 0, size - 1);
  const bluePercent = 100 - redPercent;

  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '10px',
        width: '100%',
      }}
    >
      <h2>Scoreboard</h2>
      <button onClick={() => setShowStats(!showStats)}>
        {showStats ? 'Hide Stats' : 'Show Stats'}
      </button>
      {showStats && (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div style={{ color: 'red' }}>
              <h3>Red Influence: {redInfluence}</h3>
              <p>Vote Percent: {redPercent.toFixed(2)}%</p>
            </div>
            <div style={{ color: 'blue' }}>
              <h3>Blue Influence: {blueInfluence}</h3>
              <p>Vote Percent: {bluePercent.toFixed(2)}%</p>
            </div>
          </div>
          <div
            style={{
              backgroundColor: '#f0f0f0',
              borderRadius: '5px',
              padding: '10px',
              display: 'flex',
            }}
          >
            <div
              style={{
                height: '20px',
                backgroundColor: 'red',
                borderRadius: '0px',
                transition: 'width 0.5s',
                width: `${redPercent}%`,
              }}
            ></div>
            <div
              style={{
                height: '20px',
                backgroundColor: 'blue',
                borderRadius: '0px',
                transition: 'width 0.5s',
                width: `${bluePercent}%`,
              }}
            ></div>
          </div>
        </>
      )}

      {gameState.phaseNumber === 3 &&
        gameState.redPolls.length > gameState.turnNumber &&
        gameState.bluePolls.length > gameState.turnNumber && (
          <div
            style={{
              marginTop: '10px',
              padding: '10px',
              border: '1px solid #333',
              borderRadius: '10px',
              backgroundColor: '#e0e0e0',
            }}
          >
            <div style={{ color: 'red', marginBottom: '15px' }}>
              <h3>Red Poll Results:</h3>
              <p>
                {gameState.redPolls[gameState.turnNumber]['redPercent'].toFixed(
                  2
                )}
                % voted for Red
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '20px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '5px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${gameState.redPolls[gameState.turnNumber]['redPercent']}%`,
                    backgroundColor: 'red',
                  }}
                ></div>
                <div
                  style={{
                    height: '100%',
                    width: `${100 - gameState.redPolls[gameState.turnNumber]['redPercent']}%`,
                    backgroundColor: 'blue',
                  }}
                ></div>
              </div>
            </div>
            <div style={{ color: 'blue' }}>
              <h3>Blue Poll Results:</h3>
              <p>
                {gameState.bluePolls[gameState.turnNumber][
                  'redPercent'
                ].toFixed(2)}
                % voted for Red
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '20px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '5px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${gameState.bluePolls[gameState.turnNumber]['redPercent']}%`,
                    backgroundColor: 'red',
                  }}
                ></div>
                <div
                  style={{
                    height: '100%',
                    width: `${100 - gameState.bluePolls[gameState.turnNumber]['redPercent']}%`,
                    backgroundColor: 'blue',
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Scoreboard;
