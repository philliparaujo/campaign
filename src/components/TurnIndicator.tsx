import React from 'react';
import { maxTurns, useGameState } from '../GameState';

interface TurnIndicatorProps {}

const TurnIndicator: React.FC<TurnIndicatorProps> = () => {
  const { gameState } = useGameState();
  const { turnNumber } = gameState;

  return (
    <div>
      <h1>{turnNumber === maxTurns ? 'FINAL TURN' : `TURN ${turnNumber}`}</h1>
    </div>
  );
};

export default TurnIndicator;
