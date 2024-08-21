import React, { useCallback, useEffect, useState } from 'react';
import { size, useGameState } from '../GameState';
import {
  FactCheck,
  GameId,
  PlayerAction,
  PlayerColor,
  Poll,
  PollRegion,
} from '../types';
import { canEndPhase, formatPoll, getRedSample, opponentOf } from '../utils';
import Button from './Button';
import { useGlobalState } from '../GlobalState';
import './HUD.css';

const phaseDescriptions: Record<number, string> = {
  1: 'Rent out building floors for advertising using your coins.',
  2: 'Select a region of the city to poll.',
  3: "Select how accurate your opponent's poll is.",
  4: 'Unbiased polling has now been released.',
};

interface HUDProps {
  pollInputs: Record<PlayerColor, PollRegion>;
  setPollInputs: React.Dispatch<
    React.SetStateAction<Record<PlayerColor, PollRegion>>
  >;
  settingPollRegion: PlayerColor | null;
  setSettingPollRegion: React.Dispatch<
    React.SetStateAction<PlayerColor | null>
  >;
  playerColor: PlayerColor;
  gameId: GameId;
}

const HUD: React.FC<HUDProps> = ({
  pollInputs,
  setPollInputs,
  settingPollRegion,
  setSettingPollRegion,
  playerColor,
  gameId,
}) => {
  const { updateGame } = useGlobalState();
  const {
    gameState,
    setPhaseAction,
    setFactCheck,
    savePoll,
    incrementPhaseNumber,
  } = useGameState();
  const { players, turnNumber, board, phaseNumber } = gameState;

  const [phaseActionTriggered, setPhaseActionTriggered] =
    useState<boolean>(false);
  const [nextPhaseTriggered, setNextPhaseTriggered] = useState<boolean>(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const key = name.split('.')[1];
    setPollInputs(prevInputs => ({
      ...prevInputs,
      [playerColor]: {
        ...prevInputs[playerColor],
        [key]: Math.min(Math.max(Number(value), 0), size - 1),
      },
    }));
  };

  const handleNextPhase = () => {
    incrementPhaseNumber();
    setNextPhaseTriggered(true);
  };

  const handleConductPoll = () => {
    const pollRegion = pollInputs[playerColor];
    const redPercent = getRedSample(board, pollRegion);

    const poll: Poll = { ...pollRegion, redPercent };
    handlePhaseAction('done', poll);
  };

  const handlePhaseAction = (
    action: PlayerAction,
    poll?: Poll,
    factCheck?: FactCheck
  ) => {
    if (poll) {
      savePoll(playerColor, poll);
    }
    if (factCheck) {
      setFactCheck(playerColor, factCheck);
    }
    setPhaseAction(playerColor, action);
    setPhaseActionTriggered(true);
  };

  const handleDone = () => handlePhaseAction('done');

  const handleTrust = () => handlePhaseAction('done', undefined, 'trust');
  const handleDoubt = () => handlePhaseAction('done', undefined, 'doubt');
  const handleAccuse = () => handlePhaseAction('done', undefined, 'accuse');

  useEffect(() => {
    if (phaseActionTriggered || nextPhaseTriggered) {
      updateGame(gameId, gameState)
        .then(() => {
          setPhaseActionTriggered(false);
          setNextPhaseTriggered(false);
        })
        .catch(error => {
          console.error('Error updating the game state:', error);
        });
    }
  }, [phaseActionTriggered, nextPhaseTriggered]);

  return (
    <div className="hud-container">
      {/* Game state */}
      <div className="hud-game-state">
        <div className="hud-section hud-section-red">
          <h3>Red Coins</h3>
          <div>
            <span>{players.red.coins}</span>
          </div>
        </div>

        <div className="hud-section hud-section-blue">
          <h3>Blue Coins</h3>
          <div>
            <span>{players.blue.coins}</span>
          </div>
        </div>

        <div className="hud-section">
          <Button
            onClick={handleNextPhase}
            size={'small'}
            disabled={!canEndPhase(gameState)}
          >
            Next phase
          </Button>
        </div>
      </div>

      {/* Phase description */}
      <h2 className="hud-phase-description">{phaseDescriptions[phaseNumber]}</h2>

      {/* Done button */}
      {(phaseNumber === 1 || phaseNumber === 4) && (
        <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
          <Button
            onClick={handleDone}
            disabled={gameState.players[playerColor].coins < 0}
            clicked={gameState.players[playerColor].phaseAction === 'done'}
          >
            {phaseNumber === 1 ? 'Done advertising' : 'End turn'}
          </Button>
        </div>
      )}

      {/* Turn actions */}
      {(phaseNumber === 2 || phaseNumber === 3) && (
        <div className="hud-actions">
          <div
            className={`hud-polling ${playerColor === 'red' ? 'red' : 'blue'}`}
          >
            {/* Set poll region and conduct poll */}
            {phaseNumber === 2 && (
              <>
                <div className="hud-polling-inputs">
                  <div>
                    <label>Start Row: </label>
                    <input
                      type="number"
                      name={`${playerColor}.startRow`}
                      value={pollInputs[playerColor]['startRow']}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label>Start Col: </label>
                    <input
                      type="number"
                      name={`${playerColor}.startCol`}
                      value={pollInputs[playerColor]['startCol']}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="hud-polling-inputs">
                  <div>
                    <label>End Row: </label>
                    <input
                      type="number"
                      name={`${playerColor}.endRow`}
                      value={pollInputs[playerColor]['endRow']}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label>End Col: </label>
                    <input
                      type="number"
                      name={`${playerColor}.endCol`}
                      value={pollInputs[playerColor]['endCol']}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="hud-polling-buttons">
                  <Button
                    onClick={() => {
                      setSettingPollRegion(playerColor);
                    }}
                    color={playerColor}
                    disabled={settingPollRegion === playerColor}
                  >
                    Select region
                  </Button>
                  <Button
                    onClick={() => handleConductPoll()}
                    color={playerColor}
                    clicked={players[playerColor].phaseAction === 'done'}
                 
                  >
                    Conduct Poll
                  </Button>
                </div>
              </>
            )}

            {/* Fact-check opponent's poll */}
            {phaseNumber === 3 && (
              <>
                <h3 className="hud-fact-checking-title">
                  {formatPoll(
                    players[opponentOf(playerColor)].pollHistory[turnNumber][
                      'redPercent'
                    ]
                  )}
                </h3>
                <div className="hud-fact-checking">
                  <div>
                    <Button
                      onClick={handleTrust}
                      color={'green'}
                      clicked={players[playerColor].factCheck === 'trust'}
                    >
                      Trust
                    </Button>
                    <p>(accurate)</p>
                  </div>
                  <div>
                    <Button
                      onClick={handleDoubt}
                      color={'orange'}
                      clicked={players[playerColor].factCheck === 'doubt'}
                    >
                      Doubt
                    </Button>
                    <p>(off by &gt;5 %)</p> {/* 2x doubtPenalty */}
                  </div>
                  <div>
                    <Button
                      onClick={handleAccuse}
                      color={'red'}
                      clicked={players[playerColor].factCheck === 'accuse'}
                    >
                      Accuse
                    </Button>
                    <p>(off by &gt;10 %)</p> {/* 2x accusePenalty */}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HUD;
