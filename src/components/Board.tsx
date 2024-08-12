import React from 'react';
import { PollInput } from '../App';
import { size, useGameState } from '../GameState';
import { Cell } from '../types';
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

  const isRoad = (cell: Cell | undefined) => cell?.type === 'road';

  const getBoundaryStyle = (
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
    color: string
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
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const connectTop = isRoad(board[rowIndex - 1]?.[colIndex]);
            const connectRight = isRoad(board[rowIndex]?.[colIndex + 1]);
            const connectBottom = isRoad(board[rowIndex + 1]?.[colIndex]);
            const connectLeft = isRoad(board[rowIndex]?.[colIndex - 1]);

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
                  <RoadUI
                    connectTop={connectTop}
                    connectRight={connectRight}
                    connectBottom={connectBottom}
                    connectLeft={connectLeft}
                  />
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
