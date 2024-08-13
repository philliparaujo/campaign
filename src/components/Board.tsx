import React, { useState } from 'react';
import { size, useGameState } from '../GameState';
import { Cell, PlayerColor, PollRegion } from '../types';
import BuildingUI from './Building';
import Button from './Button';
import RoadUI from './Road';

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
}

const BoardUI: React.FC<BoardUIProps> = ({
  pollInputs,
  setPollInputs,
  showRoadInfluence,
  settingPollRegion,
  setSettingPollRegion,
}) => {
  const { gameState, regenerateBoard } = useGameState();
  const { board, phaseNumber } = gameState;
  const cellSize = 100;

  const [isDragging, setIsDragging] = useState<boolean>(false);

  // return a CSS style used for formatting poll boundaries
  const getBoundaryStyle = (
    pollRegion: PollRegion,
    color: PlayerColor
  ): React.CSSProperties => {
    const { startRow, startCol, endRow, endCol } = pollRegion;

    return {
      position: 'absolute',
      top: startRow * cellSize,
      left: startCol * cellSize,
      width: (endCol - startCol + 1) * cellSize,
      height: (endRow - startRow + 1) * cellSize,
      border: `2px solid ${color}`,
      boxSizing: 'border-box',
      pointerEvents: 'none',
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

  const redPollRegion = pollInputs['red'];
  const bluePollRegion = pollInputs['blue'];

  return (
    <div
      style={{
        position: 'relative',
        width: size * cellSize,
        height: size * cellSize,
      }}
      onMouseUp={handleMouseUp}
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
                boxSizing: 'border-box',
              }}
              onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
              onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
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
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  showRoadInfluence={showRoadInfluence}
                />
              )}
            </div>
          ))
        )}
      </div>

      {phaseNumber === 2 && (
        <>
          {/* Red Poll Boundary */}
          <div style={getBoundaryStyle(redPollRegion, 'red')}></div>

          {/* Blue Poll Boundary */}
          <div style={getBoundaryStyle(bluePollRegion, 'blue')}></div>
        </>
      )}

      <Button onClick={regenerateBoard}>Regenerate board</Button>
    </div>
  );
};

export default BoardUI;
