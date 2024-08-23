import React from 'react';
import { useGameState } from '../GameState';
import { Influence } from 'shared/types';
import './Board.css';

interface FloorUIProps {
  influence: Influence;
  cost: number;
  onClick: () => void;
}

const FloorUI: React.FC<FloorUIProps> = ({ influence, cost, onClick }) => {
  const { gameState } = useGameState();
  const { phaseNumber } = gameState;

  const clickableClass =
    phaseNumber === 1 ? 'floor-ui-clickable' : 'floor-ui-not-allowed';

  return (
    <div
      className={`floor-ui ${clickableClass}`}
      style={{
        backgroundColor: influence === '' ? '#aaa' : influence,
      }}
      onClick={() => (phaseNumber === 1 ? onClick() : undefined)}
    >
      <p className="floor-ui-cost">{cost}</p>
    </div>
  );
};

export default FloorUI;
