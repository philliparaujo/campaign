import React from 'react';
import { useGameState } from '../GameState';
import { Floor, Influence } from '../types';
import FloorUI from './Floor';

interface BuildingUIProps {
  rowIndex: number;
  colIndex: number;
  floors: Floor[];
  baseCost: number;
}

const BuildingUI: React.FC<BuildingUIProps> = ({
  rowIndex,
  colIndex,
  floors,
  baseCost,
}) => {
  const { gameState, setFloorInfluence, setRedCoins, setBlueCoins } =
    useGameState();
  const { board, redCoins, blueCoins } = gameState;
  const height = floors.length;

  // calculates the cost of a floor given its index in a building's Floor[]
  const floorCost = (floorIndex: number) => {
    return baseCost + height - floorIndex - 1;
  };

  // update game state when toggling ownership of a floor
  const updateFloorInfluence = (
    rowIndex: number,
    colIndex: number,
    floorIndex: number
  ) => {
    const cell = board[rowIndex][colIndex];
    if (cell.type !== 'building') return;

    const influenceCost = floorCost(floorIndex);
    const currentInfluence = cell.floors[floorIndex].influence;

    // Determine the new influence
    const influenceOrder: Influence[] = ['', 'red', 'blue'];
    const currentIndex = influenceOrder.indexOf(currentInfluence);
    const newInfluence =
      influenceOrder[(currentIndex + 1) % influenceOrder.length];

    // Calculate new coin counts
    const newRedCoins =
      redCoins +
      (currentInfluence === 'red' ? influenceCost : 0) -
      (newInfluence === 'red' ? influenceCost : 0);
    const newBlueCoins =
      blueCoins +
      (currentInfluence === 'blue' ? influenceCost : 0) -
      (newInfluence === 'blue' ? influenceCost : 0);

    // Update game state
    setFloorInfluence(rowIndex, colIndex, floorIndex, newInfluence);
    setRedCoins(newRedCoins);
    setBlueCoins(newBlueCoins);
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
          onClick={() => updateFloorInfluence(rowIndex, colIndex, floorIndex)}
        />
      ))}
    </div>
  );
};

export default BuildingUI;
