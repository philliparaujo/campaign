import React, { useEffect, useState } from 'react';
import { size, useGameState } from '../GameState';
import { PlayerAction, PlayerColor, Poll, PollRegion } from '../types';
import { canEndPhase, formatPoll, getRedSample, opponentOf } from '../utils';
import Button from './Button';

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
  syncStateToGlobal: () => Promise<void>;
}

const HUD: React.FC<HUDProps> = ({
  pollInputs,
  setPollInputs,
  settingPollRegion,
  setSettingPollRegion,
  playerColor,
  syncStateToGlobal,
}) => {
  const {
    gameState,
    setCoins,
    setTurnNumber,
    setPhaseAction,
    savePoll,
    incrementPhaseNumber,
  } = useGameState();
  const { players, turnNumber, board, phaseNumber, debugMode } = gameState;

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

  const handlePhaseAction = (action: PlayerAction, poll?: Poll) => {
    if (poll) {
      savePoll(playerColor, poll);
    }
    setPhaseAction(playerColor, action);
    setPhaseActionTriggered(true);
  };

  // Sample a population within your boundary and save your poll result
  const handleConductPoll = () => {
    const pollRegion = pollInputs[playerColor];
    const redPercent = getRedSample(board, pollRegion);

    const poll: Poll = { ...pollRegion, redPercent };
    handlePhaseAction('conductPoll', poll);
  };

  // Trust, doubt, accuse handlers
  const handleTrust = () => handlePhaseAction('trust');
  const handleDoubt = () => handlePhaseAction('doubt');
  const handleAccuse = () => handlePhaseAction('accuse');

  const handleDone = () => handlePhaseAction('done');

  const phaseDescriptions: { [key: number]: string } = {
    1: 'Advertising',
    2: 'Polling',
    3: 'Fact-Checking',
    4: 'Funding',
  };

  // Effect to sync the state globally after any phase action
  useEffect(() => {
    if (phaseActionTriggered || nextPhaseTriggered) {
      syncStateToGlobal().then(() => {
        // Reset the phaseActionTriggered flag after syncing
        setPhaseActionTriggered(false);
        setNextPhaseTriggered(false);
      });
    }
  }, [phaseActionTriggered, nextPhaseTriggered, syncStateToGlobal]);

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
          color: '#fff',
        }}
      >
        <div style={{ textAlign: 'center', marginRight: '20px' }}>
          <h3 style={{ color: '#ff6666', margin: '5px' }}>Red Coins</h3>
          <div>
            {debugMode && (
              <Button
                onClick={() => setCoins('red', players.red.coins + 1)}
                size={'small'}
              >
                +
              </Button>
            )}
            <span style={{ margin: '0 10px' }}>{players.red.coins}</span>
            {debugMode && (
              <Button
                onClick={() => setCoins('red', players.red.coins - 1)}
                size={'small'}
              >
                -
              </Button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginRight: '20px' }}>
          <h3 style={{ color: '#6666ff', margin: '5px' }}>Blue Coins</h3>
          <div>
            {debugMode && (
              <Button
                onClick={() => setCoins('blue', players.blue.coins + 1)}
                size={'small'}
              >
                +
              </Button>
            )}
            <span style={{ margin: '0 10px' }}>{players.blue.coins}</span>
            {debugMode && (
              <Button
                onClick={() => setCoins('blue', players.blue.coins - 1)}
                size={'small'}
              >
                -
              </Button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginRight: '20px' }}>
          <h3 style={{ margin: '5px' }}>Turn Number</h3>
          <div>
            {debugMode && (
              <Button
                onClick={() => setTurnNumber(turnNumber + 1)}
                size={'small'}
              >
                +
              </Button>
            )}
            <span style={{ margin: '0 10px' }}>{turnNumber}</span>
            {debugMode && (
              <Button
                onClick={() => setTurnNumber(turnNumber - 1)}
                size={'small'}
              >
                -
              </Button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '5px' }}>Phase Number</h3>
          <div>
            <span style={{ margin: '0 10px' }}>{phaseNumber}</span>
            <Button
              onClick={handleNextPhase}
              size={'small'}
              disabled={!canEndPhase(gameState)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Phase description */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '10px',
          fontSize: '18px',
          color: '#fff',
          padding: '10px',
          backgroundColor: '#282c34',
          borderRadius: '8px',
        }}
      >
        <b>Phase {phaseNumber}:</b> {phaseDescriptions[phaseNumber]}
      </div>

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

      {phaseNumber === 2 && <h2>Select a region of the city to poll.</h2>}

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
                    clicked={players[playerColor].phaseAction === 'conductPoll'}
                  >
                    Conduct Poll
                  </Button>
                </div>
              </>
            )}

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
                    gap: '10px',
                    width: '100%',
                  }}
                >
                  <div>
                    <Button
                      onClick={handleTrust}
                      color={'green'}
                      clicked={players[playerColor].phaseAction === 'trust'}
                    >
                      Trust
                    </Button>
                    <p>(accurate)</p>
                  </div>
                  <div>
                    <Button
                      onClick={handleDoubt}
                      color={'orange'}
                      clicked={players[playerColor].phaseAction === 'doubt'}
                    >
                      Doubt
                    </Button>
                    <p>(off by &gt;5 %)</p> {/* 2x doubtPenalty */}
                  </div>
                  <div>
                    <Button
                      onClick={handleAccuse}
                      color={'red'}
                      clicked={players[playerColor].phaseAction === 'accuse'}
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
