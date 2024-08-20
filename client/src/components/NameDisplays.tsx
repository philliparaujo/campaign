import React from 'react';
import { FactCheck, PlayerAction, PlayerColor } from '../types';
import { accusationSucceeded, opponentOf } from '../utils';
import { useGameState } from '../GameState';
import './NameDisplays.css';

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
    return <div className="circle">{action === 'done' ? '✔' : '…'}</div>;
  };

  const renderDisplayName = (displayName: string, color: PlayerColor) => {
    return (
      <div
        className={`name-display ${
          color === 'red' ? 'name-display-red' : 'name-display-blue'
        }`}
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

    return factCheck && <div className="fact-check">{text}</div>;
  };

  return (
    <div className="name-displays-container">
      <div className="name-display-row">
        {renderAction(me.phaseAction)}
        {renderDisplayName(displayName, playerColor)}
        {renderFactCheck(
          me.factCheck,
          opponent.pollHistory[turnNumber]?.['redPercent'] ?? 0.5
        )}
      </div>
      {opponentDisplayName && (
        <div className="name-display-row">
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

export default NameDisplays;
