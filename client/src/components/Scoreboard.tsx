import React from 'react';
import { useGameState } from '../GameState';
import { PlayerColor } from '../types';
import { getRedSample, opponentOf } from '../utils';
import PollResults from './PollResults';

interface ScoreboardProps {
  showTruePolling: boolean;
  playerColor: PlayerColor;
}

const Scoreboard: React.FC<ScoreboardProps> = ({
  showTruePolling,
  playerColor,
}) => {
  const { gameState } = useGameState();
  const { board, players, publicOpinionHistory, turnNumber, phaseNumber } =
    gameState;
  const opponentColor = opponentOf(playerColor);

  const trueRedPercent = getRedSample(board, undefined, true);
  const redPercentResult =
    publicOpinionHistory[turnNumber]['trueRedPercent'] || 0.5;
  const redPercent = phaseNumber === 4 ? redPercentResult : trueRedPercent;

  // UI elements
  const reportedPollResults =
    players.red.pollHistory.length > turnNumber &&
    players.blue.pollHistory.length > turnNumber ? (
      <div>
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
    );
  const truePollResults = (
    <PollResults
      redPercent={redPercent}
      title={'True Poll Results'}
      truePoll={true}
    />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Phases 1/2: Only show true results if showTruePolling */}
      {(phaseNumber === 1 || phaseNumber === 2) &&
        showTruePolling &&
        truePollResults}

      {/* Phase 3: Show reported polls, only show true results if showTruePolling */}
      {phaseNumber === 3 && (
        <>
          {reportedPollResults}
          {showTruePolling && truePollResults}
        </>
      )}

      {/* Phase 4: Show true results and reported polls below */}
      {phaseNumber === 4 && (
        <>
          {truePollResults}
          {reportedPollResults}
        </>
      )}
    </div>
  );
};

export default Scoreboard;
