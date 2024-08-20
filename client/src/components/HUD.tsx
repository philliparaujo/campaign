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

  // Update poll boundary variables when any input's value changes
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

  // Sample a population within your boundary and save your poll result
  const handleConductPoll = () => {
    const pollRegion = pollInputs[playerColor];
    const redPercent = getRedSample(board, pollRegion);

    const poll: Poll = { ...pollRegion, redPercent };
    handlePhaseAction('done', poll);
  };

  // Update game state with action, then trigger global sync
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

  // Different fact-checking handlers
  const handleTrust = () => handlePhaseAction('done', undefined, 'trust');
  const handleDoubt = () => handlePhaseAction('done', undefined, 'doubt');
  const handleAccuse = () => handlePhaseAction('done', undefined, 'accuse');

  // Effect to sync the state globally after any phase action
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
    <div style={{ width: '100%', marginBottom: '20px' }}>
      {/* Game state */}
      <div
        style={{
          padding: '10px',
          border: '2px solid #333',
          borderRadius: '8px',
          backgroundColor: '#282c34',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          color: '#fff',
        }}
      >
        <div style={{ textAlign: 'center', marginRight: '20px' }}>
          <h3 style={{ color: '#ff6666', margin: '5px' }}>Red Coins</h3>
          <div>
            <span style={{ margin: '0 10px' }}>{players.red.coins}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginRight: '20px' }}>
          <h3 style={{ color: '#6666ff', margin: '5px' }}>Blue Coins</h3>
          <div>
            <span style={{ margin: '0 10px' }}>{players.blue.coins}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
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
      <h2 style={{ textAlign: 'center' }}>{phaseDescriptions[phaseNumber]}</h2>

      {/* Done button */}
      {(phaseNumber === 1 || phaseNumber === 4) && (
        <div>
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              padding: '20px',
              border: `2px solid ${playerColor}`,
              borderRadius: '10px',
              backgroundColor: playerColor === 'red' ? '#ffe5e5' : '#e5e5ff',
            }}
          >
            {/* Set poll region and conduct poll */}
            {phaseNumber === 2 && (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    marginBottom: '10px',
                  }}
                >
                  <div>
                    <label>Start Row: </label>
                    <input
                      type="number"
                      name={`${playerColor}.startRow`}
                      value={pollInputs[playerColor]['startRow']}
                      onChange={handleInputChange}
                      style={{ width: '50px', marginRight: '10px' }}
                    />
                  </div>
                  <div>
                    <label>Start Col: </label>
                    <input
                      type="number"
                      name={`${playerColor}.startCol`}
                      value={pollInputs[playerColor]['startCol']}
                      onChange={handleInputChange}
                      style={{ width: '50px', marginRight: '10px' }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    marginBottom: '10px',
                  }}
                >
                  <div>
                    <label>End Row: </label>
                    <input
                      type="number"
                      name={`${playerColor}.endRow`}
                      value={pollInputs[playerColor]['endRow']}
                      onChange={handleInputChange}
                      style={{ width: '50px', marginRight: '10px' }}
                    />
                  </div>
                  <div>
                    <label>End Col: </label>
                    <input
                      type="number"
                      name={`${playerColor}.endCol`}
                      value={pollInputs[playerColor]['endCol']}
                      onChange={handleInputChange}
                      style={{ width: '50px', marginRight: '10px' }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    alignItems: 'center',
                  }}
                >
                  <Button
                    onClick={() => {
                      setSettingPollRegion(playerColor);
                    }}
                    color={playerColor}
                    disabled={settingPollRegion === playerColor}
                  >
                    Select poll region
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
                <h3 style={{ color: playerColor, textAlign: 'center' }}>
                  {formatPoll(
                    players[opponentOf(playerColor)].pollHistory[turnNumber][
                      'redPercent'
                    ]
                  )}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: '25px',
                  }}
                >
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
