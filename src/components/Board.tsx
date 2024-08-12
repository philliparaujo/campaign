import React from 'react';
import { size, useGameState } from '../GameState';
import { Cell, PollInput } from '../types';
import { initializeBoard } from '../utils';
import BuildingUI from './Building';
import Button from './Button';
import RoadUI from './Road';

interface BoardUIProps {
  pollInputs: PollInput;
}

const BoardUI: React.FC<BoardUIProps> = ({ pollInputs }) => {
  const { gameState, setGameState } = useGameState();
  const { board, phaseNumber } = gameState;
  const cellSize = 100;

  // return a CSS style used for formatting poll boundaries
  const getBoundaryStyle = (
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
    color: 'red' | 'blue'
  ): React.CSSProperties => ({
    position: 'absolute',
    top: startRow * cellSize,
    left: startCol * cellSize,
    width: (endCol - startCol + 1) * cellSize,
    height: (endRow - startRow + 1) * cellSize,
    border: `2px solid ${color}`,
    boxSizing: 'border-box',
    pointerEvents: 'none',
  });

  return (
    <div
      style={{
        position: 'relative',
        width: size * cellSize,
        height: size * cellSize,
      }}
    >
      <div
        style={{
          display: 'grid',
          width: size * cellSize,
          height: size * cellSize,
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridGap: '0px',
        }}
      >
        {board.map((row: Cell[], rowIndex) =>
          row.map((cell, colIndex) => {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #000',
                  boxSizing: 'border-box',
                }}
              >
                {cell.type === 'building' ? (
                  <BuildingUI
                    floors={cell.floors}
                    baseCost={cell.baseCost}
                    rowIndex={rowIndex}
                    colIndex={colIndex}
                  />
                ) : (
                  <RoadUI rowIndex={rowIndex} colIndex={colIndex} />
                )}
              </div>
            );
          })
        )}
      </div>

      {phaseNumber === 2 && (
        <>
          {/* Red Poll Boundary */}
          <div
            style={getBoundaryStyle(
              pollInputs.redStartRow,
              pollInputs.redStartCol,
              pollInputs.redEndRow,
              pollInputs.redEndCol,
              'red'
            )}
          ></div>

          {/* Blue Poll Boundary */}
          <div
            style={getBoundaryStyle(
              pollInputs.blueStartRow,
              pollInputs.blueStartCol,
              pollInputs.blueEndRow,
              pollInputs.blueEndCol,
              'blue'
            )}
          ></div>
        </>
      )}

      <Button
        onClick={() =>
          setGameState(prevState => ({
            ...prevState,
            board: initializeBoard(prevState.board.length),
          }))
        }
      >
        Regenerate board
      </Button>
    </div>
  );
};

export default BoardUI;
