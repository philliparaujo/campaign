import React from 'react';
import { PlayerAction, PlayerColor } from '../types';
import { opponentOf } from '../utils';
import { useGameState } from '../GameState';

interface NameDisplaysProps {
  displayName: string;
  opponentDisplayName: string | null;
  playerColor: PlayerColor;
}

const NameDisplays: React.FC<NameDisplaysProps> = ({
  displayName,
  opponentDisplayName,
  playerColor,
}) => {
  const { gameState } = useGameState();
  const { players, phaseNumber } = gameState;

  const renderAction = (action: PlayerAction) => {
    switch (phaseNumber) {
      case 1:
        return action === 'done' ? '✔' : '…';
      case 2:
        return action === 'conductPoll' ? '✔' : '…';
      case 3:
        return action === 'accuse' || action === 'doubt' || action === 'trust'
          ? '❓'
          : '…';
      case 4:
        return action === 'done' ? '✔' : '…';
      default:
        return '…';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        flexDirection: 'column',
        border: '1px solid black',
        padding: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            ...nameStyle,
            backgroundColor: playerColor === 'red' ? '#FF3B3B' : '#3B82FF',
          }}
        >
          {displayName}
        </div>
        <div style={circleStyle}>
          {renderAction(players[playerColor].phaseAction)}
        </div>
      </div>
      {opponentDisplayName && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              ...nameStyle,
              backgroundColor:
                opponentOf(playerColor) === 'red' ? '#FF3B3B' : '#3B82FF',
            }}
          >
            {opponentDisplayName}
          </div>
          <div style={circleStyle}>
            {renderAction(players[opponentOf(playerColor)].phaseAction)}
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const nameStyle: React.CSSProperties = {
  color: 'white',
  padding: '10px 20px',
  borderRadius: '20px',
  fontWeight: 'bold',
  textAlign: 'center',
  minWidth: '80px',
};

const circleStyle: React.CSSProperties = {
  backgroundColor: 'black',
  color: 'white',
  borderRadius: '50%',
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px', // Increased font size for better visibility
};

export default NameDisplays;
