import React from 'react';
import { maxTurns, useGameState } from '../GameState';

interface TurnIndicatorProps {}

const TurnIndicator: React.FC<TurnIndicatorProps> = () => {
  const { gameState } = useGameState();
  const { turnNumber } = gameState;

  return (
    <div
      style={{
        fontSize: '3rem',
        fontWeight: 'bold',
        color: 'black',
      }}
    >
      {turnNumber === maxTurns ? 'FINAL TURN' : `TURN ${turnNumber}`}
    </div>
  );
};

export default TurnIndicator;
