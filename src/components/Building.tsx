import React from 'react';
import { useGameState } from '../GameState';
import { Floor, Influence, PlayerColor } from '../types';
import FloorUI from './Floor';

interface BuildingUIProps {
  rowIndex: number;
  colIndex: number;
  floors: Floor[];
  baseCost: number;
  playerColor: PlayerColor;
}

const BuildingUI: React.FC<BuildingUIProps> = ({
  rowIndex,
  colIndex,
  floors,
  baseCost,
  playerColor,
}) => {
  const { gameState, setFloorInfluence, setCoins } = useGameState();
  const { board, players } = gameState;
  const height = floors.length;

  // calculates the cost of a floor given its index in a building's Floor[]
  const floorCost = (floorIndex: number) => {
    return baseCost + height - floorIndex - 1;
  };

  // update game state when toggling ownership of a floor
  const updateFloorInfluence = async (
    rowIndex: number,
    colIndex: number,
    floorIndex: number,
    playerColor: PlayerColor
  ) => {
    const cell = board[rowIndex][colIndex];
    if (cell.type !== 'building') return;

    const influenceCost = floorCost(floorIndex);
    const currentInfluence = cell.floors[floorIndex].influence;
    if (currentInfluence !== '' && currentInfluence !== playerColor) {
      return;
    }

    // Determine the new influence
    const newInfluence = currentInfluence === '' ? playerColor : '';

    // Calculate new coin counts
    const newCoins =
      players[playerColor].coins +
      (currentInfluence === '' ? -influenceCost : influenceCost);

    // Update game state
    setFloorInfluence(rowIndex, colIndex, floorIndex, newInfluence);
    setCoins(playerColor, newCoins);
  };

  return (
    <div
      style={{
        width: `60px`,
        height: `${height * 20}px`,
        border: '1px solid #000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {floors.map((floor, floorIndex) => (
        <FloorUI
          key={floorIndex}
          influence={floor.influence}
          cost={floorCost(floorIndex)}
          onClick={() =>
            updateFloorInfluence(rowIndex, colIndex, floorIndex, playerColor)
          }
        />
      ))}
    </div>
  );
};

export default BuildingUI;
