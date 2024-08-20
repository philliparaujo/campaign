import React from 'react';
import { FactCheck, PlayerAction, PlayerColor } from '../types';
import { accusationSucceeded, opponentOf } from '../utils';
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
  const { players, phaseNumber, turnNumber, publicOpinionHistory } = gameState;

  const me = players[playerColor];
  const opponent = players[opponentOf(playerColor)];

  const renderAction = (action: PlayerAction) => {
    return <div style={circleStyle}>{action === 'done' ? '✔' : '…'}</div>;
  };

  const renderDisplayName = (displayName: string, color: PlayerColor) => {
    return (
      <div
        style={{
          ...nameStyle,
          backgroundColor: color === 'red' ? '#FF3B3B' : '#3B82FF',
        }}
      >
        {displayName}
      </div>
    );
  };

  const renderFactCheck = (factCheck: FactCheck, opponentPercent: number) => {
    let text;
    switch (phaseNumber) {
      case 3:
        text = '❓';
        break;
      case 4:
        const truePercent =
          publicOpinionHistory[turnNumber]['trueRedPercent'] ?? 0.5;
        let succeeded = accusationSucceeded(
          factCheck,
          truePercent,
          opponentPercent
        );
        text = `${succeeded ? '✔️' : '❌'} ${factCheck.toUpperCase()}`;
        break;
      default:
        text = '';
    }

    return factCheck && <div style={factCheckStyle}>{text}</div>;
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {renderAction(me.phaseAction)}
        {renderDisplayName(displayName, playerColor)}
        {renderFactCheck(
          me.factCheck,
          opponent.pollHistory[turnNumber]?.['redPercent'] ?? 0.5
        )}
      </div>
      {opponentDisplayName && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {renderAction(opponent.phaseAction)}
          {renderDisplayName(opponentDisplayName, opponentOf(playerColor))}
          {renderFactCheck(
            opponent.factCheck,
            me.pollHistory[turnNumber]?.['redPercent'] ?? 0.5
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
  fontSize: '14px',
};

const factCheckStyle: React.CSSProperties = {
  backgroundColor: '#CCCCCC',
  color: '#333333',
  padding: '5px 10px',
  borderRadius: '12px',
  fontWeight: 'bold',
  textAlign: 'center',
  minWidth: '60px',
  fontSize: '12px',
};

export default NameDisplays;
