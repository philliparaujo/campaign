import React from 'react';
import { maxTurns, useGameState } from '../GameState';
import './TurnIndicator.css'; // Import the CSS file

interface TurnIndicatorProps {}

const TurnIndicator: React.FC<TurnIndicatorProps> = () => {
  const { gameState } = useGameState();
  const { turnNumber } = gameState;

  return (
    <div className={'turn-indicator'}>
      {turnNumber === maxTurns ? 'FINAL TURN' : `TURN ${turnNumber}`}
    </div>
  );
};

export default TurnIndicator;
