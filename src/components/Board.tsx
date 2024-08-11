import React from 'react';
import BuildingUI from './Building';
import RoadUI from './Road';
import { Influence } from '../App';

interface BoardUIProps {
  size: number;
  board: Cell[][];
  setBoard: React.Dispatch<React.SetStateAction<Cell[][]>>;
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

const BoardUI: React.FC<BoardUIProps> = ({ size, board, setBoard }) => {
  const cellSize = 100;

  const isRoad = (cell: Cell | undefined) => cell?.type === 'road';

  const updateFloorInfluence = (
    rowIndex: number,
    colIndex: number,
    floorIndex: number
  ) => {
    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      const cell = newBoard[rowIndex][colIndex];

      // Check if the cell is a BuildingCell
      if (cell.type === 'building') {
        const currentInfluence = cell.floors[floorIndex].influence;
        const newInfluence =
          currentInfluence === ''
            ? 'red'
            : currentInfluence === 'red'
              ? 'blue'
              : '';
        newBoard[rowIndex][colIndex] = {
          ...cell,
          floors: cell.floors.map((floor, index) =>
            index === floorIndex ? { ...floor, influence: newInfluence } : floor
          ),
        };
      }

      console.log(newBoard);
      return newBoard;
    });
  };

  return (
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
                  updateFloorInfluence={updateFloorInfluence}
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
  );
};

export default BoardUI;
