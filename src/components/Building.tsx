import React from 'react';
import { Floor } from './Board';
import FloorUI from './Floor';

interface BuildingUIProps {
  rowIndex: number;
  colIndex: number;
  floors: Floor[];
  baseCost: number;
  updateFloorInfluence: (
    rowIndex: number,
    colIndex: number,
    floorIndex: number
  ) => void;
}

const BuildingUI: React.FC<BuildingUIProps> = ({
  rowIndex,
  colIndex,
  floors,
  baseCost,
  updateFloorInfluence,
}) => {
  const height = floors.length;

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
          cost={baseCost + height - floorIndex - 1}
          onClick={() => updateFloorInfluence(rowIndex, colIndex, floorIndex)}
        />
      ))}
    </div>
  );
};

export default BuildingUI;
