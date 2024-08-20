import React, { useState, useEffect } from 'react';
import { size, useGameState } from '../GameState';
import { Cell, PlayerColor, PollRegion } from '../types';
import BuildingUI from './Building';
import RoadUI from './Road';
import './Board.css';

interface BoardUIProps {
  pollInputs: Record<PlayerColor, PollRegion>;
  setPollInputs: React.Dispatch<
    React.SetStateAction<Record<PlayerColor, PollRegion>>
  >;
  showRoadInfluence: boolean;
  settingPollRegion: PlayerColor | null;
  setSettingPollRegion: React.Dispatch<
    React.SetStateAction<PlayerColor | null>
  >;
  playerColor: PlayerColor;
}

const BoardUI: React.FC<BoardUIProps> = ({
  pollInputs,
  setPollInputs,
  showRoadInfluence,
  settingPollRegion,
  setSettingPollRegion,
  playerColor,
}) => {
  const { gameState } = useGameState();
  const { board, phaseNumber } = gameState;

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const myPollInputs = pollInputs[playerColor];

  useEffect(() => {
    document.documentElement.style.setProperty('--board-size', `${size}`);
  }, []);

  const getBoundaryStyle = (): React.CSSProperties => {
    const { startRow, startCol, endRow, endCol } = myPollInputs;

    return {
      position: 'absolute',
      top: `calc(${startRow} * var(--cell-size))`,
      left: `calc(${startCol} * var(--cell-size))`,
      width: `calc((${endCol} - ${startCol} + 1) * var(--cell-size))`,
      height: `calc((${endRow} - ${startRow} + 1) * var(--cell-size))`,
      border: `2px solid ${playerColor}`,
      boxSizing: 'border-box',
      pointerEvents: 'none',
      backgroundColor:
        playerColor === 'red'
          ? 'rgba(255, 0, 0, 0.05)'
          : 'rgba(0, 0, 255, 0.05)',
    };
  };

  const handleMouseDown = (rowIndex: number, colIndex: number) => {
    if (settingPollRegion !== null) {
      setIsDragging(true);

      // Start the poll region by setting the top-left corner directly in pollInputs
      setPollInputs(prevInputs => ({
        ...prevInputs,
        [settingPollRegion]: {
          startRow: rowIndex,
          startCol: colIndex,
          endRow: rowIndex,
          endCol: colIndex,
        },
      }));
    }
  };

  const handleMouseEnter = (rowIndex: number, colIndex: number) => {
    if (settingPollRegion !== null) {
      setPollInputs(prevInputs => {
        if (isDragging) {
          // While dragging, update the endRow and endCol only
          return {
            ...prevInputs,
            [settingPollRegion]: {
              ...prevInputs[settingPollRegion],
              endRow: rowIndex,
              endCol: colIndex,
            },
          };
        } else {
          // If not dragging, update both startRow/startCol and endRow/endCol
          return {
            ...prevInputs,
            [settingPollRegion]: {
              startRow: rowIndex,
              startCol: colIndex,
              endRow: rowIndex,
              endCol: colIndex,
            },
          };
        }
      });
    }
  };

  const handleMouseUp = () => {
    if (settingPollRegion !== null) {
      // Finish setting the poll region and reset the settingPollRegion to null
      setIsDragging(false);
      setSettingPollRegion(null);
    }
  };

  return (
    <div className="board-container" onMouseUp={handleMouseUp}>
      <div className="board-grid">
        {board.map((row: Cell[], rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="board-cell"
              onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
              onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
            >
              {cell.type === 'building' ? (
                <BuildingUI
                  floors={cell.floors}
                  baseCost={cell.baseCost}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  playerColor={playerColor}
                />
              ) : (
                <RoadUI
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  showRoadInfluence={showRoadInfluence}
                />
              )}
            </div>
          ))
        )}
      </div>

      {phaseNumber === 2 && playerColor && (
        <div style={getBoundaryStyle()}></div>
      )}
    </div>
  );
};

export default BoardUI;
