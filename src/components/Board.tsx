import React from 'react';
import { Influence } from '../App';
import { useGameState } from '../GameState';
import BuildingUI from './Building';
import RoadUI from './Road';
import { initializeBoard } from '../utils';

interface BoardUIProps {
  size: number;
}

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

const BoardUI: React.FC<BoardUIProps> = ({ size }) => {
  const { gameState, setGameState } = useGameState();
  const { board } = gameState;
  const cellSize = 100;

  const isRoad = (cell: Cell | undefined) => cell?.type === 'road';

  return (
    <>
      <div
        style={{
          display: 'grid',
          width: size * cellSize,
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
      <button
        onClick={() =>
          setGameState(prevState => ({
            ...prevState,
            board: initializeBoard(prevState.board.length),
          }))
        }
      >
        Regenerate board
      </button>
    </>
  );
};

export default BoardUI;
