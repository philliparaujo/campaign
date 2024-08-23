import React from 'react';
import { useGameState } from '../GameState';
import { Cell } from 'shared/types';
import {
  calculatePercentInfluence,
  calculateRoadInfluence,
} from 'shared/utils';

interface RoadUIProps {
  rowIndex: number;
  colIndex: number;
  showRoadInfluence: boolean;
}

type Color = { r: number; g: number; b: number };

// Choose color in-between start and end based on percent
const interpolateColor = (
  startColor: Color,
  endColor: Color,
  percent: number
) => {
  const r = Math.round(startColor.r + percent * (endColor.r - startColor.r));
  const g = Math.round(startColor.g + percent * (endColor.g - startColor.g));
  const b = Math.round(startColor.b + percent * (endColor.b - startColor.b));
  return `rgb(${r},${g},${b})`;
};

const RoadUI: React.FC<RoadUIProps> = ({
  rowIndex,
  colIndex,
  showRoadInfluence,
}) => {
  const { gameState } = useGameState();
  const { board } = gameState;

  // return whether a cell is a road, if that cell is in bounds
  const isRoad = (cell: Cell | undefined): boolean => cell?.type === 'road';

  /* On setting toggle, show road influence via road background color */
  const roadPercentInfluence = calculatePercentInfluence(
    calculateRoadInfluence('red', board, rowIndex, colIndex),
    calculateRoadInfluence('blue', board, rowIndex, colIndex)
  );

  const color1: Color = { r: 135, g: 135, b: 255 }; // red = 0% votes
  const color2: Color = { r: 208, g: 208, b: 208 }; // red = 50% votes
  const color3: Color = { r: 255, g: 135, b: 135 }; // red = 100% votes

  // Calculate background color if showing road influence (debug option)
  let backgroundColor = `rgb(208, 208, 208)`;
  if (showRoadInfluence) {
    if (roadPercentInfluence <= 0.5) {
      backgroundColor = interpolateColor(
        color1,
        color2,
        roadPercentInfluence / 0.5
      );
    } else {
      backgroundColor = interpolateColor(
        color2,
        color3,
        (roadPercentInfluence - 0.5) / 0.5
      );
    }
  }

  // Determine which adjacent roads to connect to
  const connectTop = isRoad(board[rowIndex - 1]?.[colIndex]);
  const connectRight = isRoad(board[rowIndex]?.[colIndex + 1]);
  const connectBottom = isRoad(board[rowIndex + 1]?.[colIndex]);
  const connectLeft = isRoad(board[rowIndex]?.[colIndex - 1]);

  const isIsolated =
    !connectTop && !connectRight && !connectBottom && !connectLeft;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: backgroundColor,
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {isIsolated ? (
        // Render a dot in the center if the road is isolated
        <div
          style={{
            width: '10px',
            height: '10px',
            backgroundColor: '#333',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ) : (
        <>
          {/* Vertical road */}
          <div
            style={{
              position: 'absolute',
              top: connectTop ? '0' : '50%',
              bottom: connectBottom ? '0' : '50%',
              left: '50%',
              width: '10px',
              transform: 'translateX(-50%)',
              backgroundColor: '#333',
            }}
          ></div>
          {/* Horizontal road */}
          <div
            style={{
              position: 'absolute',
              left: connectLeft ? '0' : '50%',
              right: connectRight ? '0' : '50%',
              top: '50%',
              height: '10px',
              transform: 'translateY(-50%)',
              backgroundColor: '#333',
            }}
          ></div>
        </>
      )}
    </div>
  );
};

export default RoadUI;
