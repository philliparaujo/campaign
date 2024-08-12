import React from 'react';
import { useGameState } from '../GameState';
import { Cell } from '../types';

interface RoadUIProps {
  rowIndex: number;
  colIndex: number;
}

const RoadUI: React.FC<RoadUIProps> = ({ rowIndex, colIndex }) => {
  const { gameState } = useGameState();
  const { board } = gameState;

  // return whether a cell is a road, if that cell is in bounds
  const isRoad = (cell: Cell | undefined): boolean => cell?.type === 'road';

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
        backgroundColor: '#d0d0d0',
        position: 'relative',
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
