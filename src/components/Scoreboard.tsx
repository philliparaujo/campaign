import React, { useState } from 'react';
import { useGameState } from '../GameState';
import {
  calculateTotalInfluence,
  formatPoll,
  getRedSample,
  opponentOf,
} from '../utils';
import Button from './Button';
import { PlayerColor } from '../types';
import PollResults from './PollResults';

interface ScoreboardProps {
  showRoadInfluence: boolean;
  showTruePolling: boolean;
  setShowRoadInfluence: React.Dispatch<React.SetStateAction<boolean>>;
  playerColor: PlayerColor;
}

const Scoreboard: React.FC<ScoreboardProps> = ({
  showRoadInfluence,
  showTruePolling,
  setShowRoadInfluence,
  playerColor,
}) => {
  const { gameState } = useGameState();
  const {
    board,
    players,
    publicOpinionHistory,
    turnNumber,
    phaseNumber,
    debugMode,
  } = gameState;
  const opponentColor = opponentOf(playerColor);

  const trueRedPercent = getRedSample(board, undefined, true);
  const redPercentResult =
    publicOpinionHistory[turnNumber]['trueRedPercent'] || 0.5;

  const redPercent = phaseNumber === 4 ? redPercentResult : trueRedPercent;

  return (
    <div>
      {/* Reported poll results */}
      {phaseNumber === 3 &&
        (players.red.pollHistory.length > turnNumber &&
        players.blue.pollHistory.length > turnNumber ? (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <PollResults
              redPercent={
                players[playerColor].pollHistory[turnNumber]['redPercent']
              }
              title={'Your Poll'}
            />
            <PollResults
              redPercent={
                players[opponentColor].pollHistory[turnNumber]['redPercent']
              }
              title={'Opponent Poll'}
            />
          </div>
        ) : (
          'Polls not reported properly'
        ))}

      {/* True poll results */}
      {(showTruePolling || phaseNumber === 4) && (
        <>
          <PollResults
            redPercent={redPercent}
            title={'Poll Results'}
            truePoll={true}
          />
        </>
      )}
    </div>
  );
};

export default Scoreboard;
