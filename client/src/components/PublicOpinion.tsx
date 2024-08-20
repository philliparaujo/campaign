import React from 'react';
import { useGameState } from '../GameState';
import { formatPublicOpinion } from '../utils';

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
    <div>
      {/* Public opinion header and result */}
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <h3 style={{ paddingRight: '22.5%' }}>Public Opinion:</h3>
        {formatPublicOpinion(
          redPublicOpinion,
          prevRedPublicOpinion,
          phaseNumber
        )}
      </div>

      {/* Shows visual bars for public opinion */}
      {redPublicOpinion !== undefined && (
        <>
          <div
            style={{
              borderRadius: '5px',
              display: 'flex',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                height: '20px',
                backgroundColor: 'red',
                borderRadius: '0px',
                transition: 'width 2.0s',
                width: `${redPublicOpinion * 100}%`,
              }}
            ></div>
            <div
              style={{
                height: '20px',
                backgroundColor: 'blue',
                borderRadius: '0px',
                transition: 'width 2.0s',
                width: `${bluePublicOpinion * 100}%`,
              }}
            ></div>
          </div>
        </>
      )}
    </div>
  );
};

export default PublicOpinion;
