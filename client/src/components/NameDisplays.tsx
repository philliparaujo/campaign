import React from 'react';
import { FactCheck, PlayerAction, PlayerColor } from '../types';
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
  const me = players[playerColor];
  const opponent = players[opponentOf(playerColor)];

  const renderAction = (action: PlayerAction) => {
    return action === 'done' ? '✔' : '…';
  };

  const renderFactCheck = (factCheck: FactCheck) => {
    switch (phaseNumber) {
      case 3:
        return '❓';
      case 4:
        return factCheck;
      default:
        return '';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        flexDirection: 'column',
        padding: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={circleStyle}>{renderAction(me.phaseAction)}</div>
        <div
          style={{
            ...nameStyle,
            backgroundColor: playerColor === 'red' ? '#FF3B3B' : '#3B82FF',
          }}
        >
          {displayName}
        </div>
        {me.factCheck && (
          <div style={factCheckStyle}>{renderFactCheck(me.factCheck)}</div>
        )}
      </div>
      {opponentDisplayName && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={circleStyle}>{renderAction(opponent.phaseAction)}</div>
          <div
            style={{
              ...nameStyle,
              backgroundColor:
                opponentOf(playerColor) === 'red' ? '#FF3B3B' : '#3B82FF',
            }}
          >
            {opponentDisplayName}
          </div>
          {opponent.factCheck && (
            <div style={factCheckStyle}>
              {renderFactCheck(opponent.factCheck)}
            </div>
          )}
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

const factCheckStyle: React.CSSProperties = {
  backgroundColor: '#CCCCCC', // Light gray background
  color: '#333333', // Darker gray text color
  padding: '5px 10px',
  borderRadius: '12px',
  fontWeight: 'bold',
  textAlign: 'center',
  minWidth: '60px',
  fontSize: '12px',
};

export default NameDisplays;
