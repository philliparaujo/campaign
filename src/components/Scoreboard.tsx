import React, { useState } from 'react';
import { useGameState } from '../GameState';
import { calculateTotalInfluence, formatPoll, getRedSample } from '../utils';
import Button from './Button';

interface ScoreboardProps {
  showRoadInfluence: boolean;
  setShowRoadInfluence: React.Dispatch<React.SetStateAction<boolean>>;
}

const Scoreboard: React.FC<ScoreboardProps> = ({
  showRoadInfluence,
  setShowRoadInfluence,
}) => {
  const { gameState } = useGameState();
  const {
    board,
    redPolls,
    bluePolls,
    redPublicOpinion,
    turnNumber,
    phaseNumber,
    debugMode,
  } = gameState;
  const [showStats, setShowStats] = useState<boolean>(false);

  let redInfluence = calculateTotalInfluence('red', board);
  let blueInfluence = calculateTotalInfluence('blue', board);

  const size = board.length;
  const currentRedPercent = getRedSample(board, 0, size - 1, 0, size - 1, true);
  const currentBluePercent = 1 - currentRedPercent;

  const redPercentResult =
    redPublicOpinion[turnNumber]['trueRedPercent'] || 0.5;
  const bluePercentResult = 1 - redPercentResult;

  const redPercent = phaseNumber === 4 ? redPercentResult : currentRedPercent;
  const bluePercent =
    phaseNumber === 4 ? bluePercentResult : currentBluePercent;

  console.log(redPublicOpinion);

  return (
    <div
      style={{
        padding: debugMode || phaseNumber >= 2 ? '2.5%' : '0px',
        border: debugMode || phaseNumber >= 2 ? '1px solid #ccc' : 'none',
        borderRadius: '10px',
        width: '95%',
      }}
    >
      {/* True polling button */}
      {debugMode && phaseNumber !== 4 && (
        <Button onClick={() => setShowStats(!showStats)} size={'small'}>
          {showStats ? 'Hide True Polling' : 'Show True Polling'}
        </Button>
      )}

      {/* True road influence button */}
      {(debugMode || phaseNumber === 2) && (
        <Button
          onClick={() => setShowRoadInfluence(!showRoadInfluence)}
          size={'small'}
        >
          {showRoadInfluence ? 'Hide Road Influence' : 'Show Road Influence'}
        </Button>
      )}

      {/* Reported poll results */}
      {phaseNumber === 3 &&
        (redPolls.length > turnNumber && bluePolls.length > turnNumber ? (
          <div
            style={{
              marginTop: '10px',
              padding: '10px',
              border: '1px solid #333',
              borderRadius: '10px',
              backgroundColor: '#e0e0e0',
            }}
          >
            <div style={{ color: 'red', marginBottom: '15px' }}>
              <h3>Red Poll Results:</h3>
              {formatPoll(redPolls[turnNumber]['redPercent'])}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '20px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '5px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${redPolls[turnNumber]['redPercent'] * 100}%`,
                    backgroundColor: 'red',
                  }}
                ></div>
                <div
                  style={{
                    height: '100%',
                    width: `${(1 - redPolls[turnNumber]['redPercent']) * 100}%`,
                    backgroundColor: 'blue',
                  }}
                ></div>
              </div>
            </div>
            <div style={{ color: 'blue' }}>
              <h3>Blue Poll Results:</h3>
              {formatPoll(bluePolls[turnNumber]['redPercent'])}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '20px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '5px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${bluePolls[turnNumber]['redPercent'] * 100}%`,
                    backgroundColor: 'red',
                  }}
                ></div>
                <div
                  style={{
                    height: '100%',
                    width: `${(1 - bluePolls[turnNumber]['redPercent']) * 100}%`,
                    backgroundColor: 'blue',
                  }}
                ></div>
              </div>
            </div>
          </div>
        ) : (
          'Polls not reported properly'
        ))}

      {/* True poll results */}
      {(showStats || phaseNumber === 4) && (
        <>
          <h3>Poll Results: {formatPoll(redPercent)}</h3>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div style={{ color: 'red' }}>
              <h3>Red Influence: {redInfluence}</h3>
              <p>Vote Percent: {(redPercent * 100).toFixed(2)}%</p>
            </div>
            <div style={{ color: 'blue' }}>
              <h3>Blue Influence: {blueInfluence}</h3>
              <p>Vote Percent: {(bluePercent * 100).toFixed(2)}%</p>
            </div>
          </div>
          <div
            style={{
              backgroundColor: '#f0f0f0',
              borderRadius: '5px',
              padding: '10px',
              display: 'flex',
            }}
          >
            <div
              style={{
                height: '20px',
                backgroundColor: 'red',
                borderRadius: '0px',
                transition: 'width 0.5s',
                width: `${redPercent * 100}%`,
              }}
            ></div>
            <div
              style={{
                height: '20px',
                backgroundColor: 'blue',
                borderRadius: '0px',
                transition: 'width 0.5s',
                width: `${bluePercent * 100}%`,
              }}
            ></div>
          </div>
        </>
      )}
    </div>
  );
};

export default Scoreboard;
