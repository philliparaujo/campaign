import React from 'react';
import { useGameState } from '../GameState';
import FloorUI from './Floor';
import { Cell, Floor } from '../types';

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
  const { gameState, setGameState } = useGameState();
  const { board, redCoins, blueCoins } = gameState;
  const height = floors.length;

  const floorCost = (floorIndex: number) => {
    return baseCost + height - floorIndex - 1;
  };

  const updateFloorInfluence = (
    rowIndex: number,
    colIndex: number,
    floorIndex: number
  ) => {
    const cell = board[rowIndex][colIndex];
    if (cell.type !== 'building') return;

    const influenceCost = floorCost(floorIndex);

    const currentInfluence = cell.floors[floorIndex].influence;
    const newInfluence =
      currentInfluence === ''
        ? 'red'
        : currentInfluence === 'red'
          ? 'blue'
          : '';
    const newCell: Cell = {
      ...cell,
      floors: cell.floors.map((floor, index) =>
        index === floorIndex ? { ...floor, influence: newInfluence } : floor
      ),
    };

    const newRedCoins =
      redCoins +
      (currentInfluence === 'red' ? influenceCost : 0) -
      (newInfluence === 'red' ? influenceCost : 0);
    const newBlueCoins =
      blueCoins +
      (currentInfluence === 'blue' ? influenceCost : 0) -
      (newInfluence === 'blue' ? influenceCost : 0);

    setGameState(prevState => ({
      ...prevState,
      redCoins: newRedCoins,
      blueCoins: newBlueCoins,
      board: prevState.board.map((row, i) =>
        row.map((cell, j) =>
          i === rowIndex && j === colIndex ? newCell : cell
        )
      ),
    }));
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
