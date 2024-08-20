import React from 'react';
import { GameId } from '../types';

interface GameIdDisplayProps {
  gameId: GameId;
}

const GameIdDisplay: React.FC<GameIdDisplayProps> = ({ gameId }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#555',
      }}
    >
      <span>Game ID: {gameId}</span>
    </div>
  );
};

export default GameIdDisplay;
