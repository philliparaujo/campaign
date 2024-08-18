import React from 'react';
import { useGameState } from '../GameState';
import { formatPoll, formatPublicOpinion } from '../utils';

interface PublicOpinionProps {}

const PublicOpinion: React.FC<PublicOpinionProps> = () => {
  const { gameState } = useGameState();
  const { turnNumber, phaseNumber, publicOpinionHistory } = gameState;

  const redPublicOpinion =
    publicOpinionHistory[turnNumber]?.redPublicOpinion[phaseNumber - 1];
  const bluePublicOpinion = 1 - redPublicOpinion;

  return (
    <div
      style={{
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <h3 style={{ paddingRight: '22.5%' }}>Public Opinion:</h3>
        {formatPublicOpinion(redPublicOpinion)}
      </div>
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
                transition: 'width 0.5s',
                width: `${redPublicOpinion * 100}%`,
              }}
            ></div>
            <div
              style={{
                height: '20px',
                backgroundColor: 'blue',
                borderRadius: '0px',
                transition: 'width 0.5s',
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
