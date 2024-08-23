import React from 'react';
import { useGameState } from '../GameState';
import { formatPublicOpinion } from 'shared/utils';
import './PublicOpinion.css';

interface PublicOpinionProps {}

const PublicOpinion: React.FC<PublicOpinionProps> = () => {
  const { gameState } = useGameState();
  const { turnNumber, phaseNumber, publicOpinionHistory } = gameState;

  const redPublicOpinion =
    publicOpinionHistory[turnNumber]?.redPublicOpinion[phaseNumber - 1];
  const bluePublicOpinion = 1 - redPublicOpinion;

  const prevPhaseNumber = phaseNumber === 1 ? 4 : phaseNumber - 1;
  const prevTurnNumber = phaseNumber === 1 ? turnNumber - 1 : turnNumber;
  const prevRedPublicOpinion =
    publicOpinionHistory[prevTurnNumber]?.redPublicOpinion[prevPhaseNumber - 1];

  return (
    <div className="public-opinion-container">
      {/* Public opinion header and result */}
      <div className="public-opinion-header">
        <h2>Public Opinion:</h2>
        <div className="public-opinion-values">
          {formatPublicOpinion(
            redPublicOpinion,
            prevRedPublicOpinion,
            phaseNumber
          )}
        </div>
      </div>

      {/* Shows visual bars for public opinion */}
      {redPublicOpinion !== undefined && (
        <div className="public-opinion-bars">
          <div
            className="public-opinion-bar-red"
            style={{ width: `${redPublicOpinion * 100}%` }}
          ></div>
          <div
            className="public-opinion-bar-blue"
            style={{ width: `${bluePublicOpinion * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default PublicOpinion;
