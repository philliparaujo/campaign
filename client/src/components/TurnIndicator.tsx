import React from 'react';
import { useGameState } from '../GameState';
import './TurnIndicator.css'; // Import the CSS file
import { maxTurns } from 'shared/GameSettings';

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
