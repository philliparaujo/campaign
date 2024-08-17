import React from 'react';
import { useGameState } from '../GameState';
import { formatPoll } from '../utils';

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
        paddingLeft: '5%',
        paddingRight: '5%',
        border: '1px solid #ccc',
        borderRadius: '10px',
        width: '90%',
      }}
    >
      <h4>Public Opinion:</h4>
      {redPublicOpinion !== undefined && (
        <>
          {formatPoll(redPublicOpinion)}
          <div
            style={{
              backgroundColor: '#f0f0f0',
              borderRadius: '5px',
              padding: '5px',
              display: 'flex',
            }}
          >
            <div
              style={{
                height: '10px',
                backgroundColor: 'red',
                borderRadius: '0px',
                transition: 'width 0.5s',
                width: `${redPublicOpinion * 100}%`,
              }}
            ></div>
            <div
              style={{
                height: '10px',
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
