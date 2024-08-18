import React from 'react';
import { Influence } from '../types';
import { useGameState } from '../GameState';

interface FloorUIProps {
  influence: Influence;
  cost: number;
  onClick: () => void;
}

const FloorUI: React.FC<FloorUIProps> = ({ influence, cost, onClick }) => {
  const { gameState } = useGameState();
  const { phaseNumber } = gameState;

  return (
    <div
      style={{
        width: `60px`,
        height: `20px`,
        backgroundColor: influence === '' ? '#aaa' : influence,
        border: '1px solid #000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        userSelect: 'none',
        cursor: phaseNumber === 1 ? 'default' : 'not-allowed',
      }}
      onClick={() => (phaseNumber === 1 ? onClick() : undefined)}
    >
      <p
        style={{
          margin: 0,
          fontSize: '14px',
          textAlign: 'right',
          color: 'black',
        }}
      >
        {cost}
      </p>
    </div>
  );
};

export default FloorUI;
