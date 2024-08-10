import React, { useState, useEffect } from 'react';
import Building from './Building';

interface BoardProps {
  size: number;
}

interface Road {
  type: 'road';
}

interface BuildingCell {
  type: 'building';
  height: number;
}

type Cell = Road | BuildingCell;

const Board: React.FC<BoardProps> = ({ size }) => {
  const [board, setBoard] = useState<Cell[][]>([]);

  useEffect(() => {
    const initializeBoard = () => {
      const newBoard: Cell[][] = Array(size)
        .fill(null)
        .map(() =>
          Array(size)
            .fill(null)
            .map(() => {
              const isBuilding = Math.random() > 0.5;
              if (isBuilding) {
                return {
                  type: 'building',
                  height: Math.floor(Math.random() * 3) + 1,
                };
              } else {
                return { type: 'road' };
              }
            })
        );
      setBoard(newBoard);
    };

    initializeBoard();
  }, [size]);

  const cellSize = 100;

  return (
    <div
      style={{
        display: 'grid',
        width: size * cellSize,
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gridGap: '5px',
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
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
              <Building height={cell.height} width={60} />
            ) : (
              'ROAD'
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Board;
