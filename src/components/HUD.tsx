import React from 'react';
import { size, useGameState } from '../GameState';
import { PlayerColor, Poll, PollRegion } from '../types';
import { canEndPhase, getRedSample } from '../utils';
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
}

const HUD: React.FC<HUDProps> = ({
  pollInputs,
  setPollInputs,
  settingPollRegion,
  setSettingPollRegion,
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

  // Update poll boundary variables when any input's value changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const [color, key] = name.split('.');
    setPollInputs(prevInputs => ({
      ...prevInputs,
      [color]: {
        ...prevInputs[color as keyof typeof prevInputs],
        [key]: Math.min(Math.max(Number(value), 0), size - 1),
      },
    }));
  };

  // Sample a population within your boundary and save your poll result
  const handleConductPoll = (pollColor: PlayerColor) => {
    const pollRegion = pollInputs[pollColor];
    const redPercent = getRedSample(board, pollRegion);

    const poll: Poll = { ...pollRegion, redPercent };

    savePoll(pollColor, poll);
    setPhaseAction(pollColor, 'conductPoll');
  };

  const phaseDescriptions: { [key: number]: string } = {
    1: 'Advertising',
    2: 'Polling',
    3: 'Fact-Checking',
    4: 'Funding',
  };

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
              onClick={() => incrementPhaseNumber()}
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

      {/* Turn actions */}
      {phaseNumber === 2 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '20px',
          }}
        >
          {/* Red Polling Column */}
          <div
            style={{
              width: '45%',
              padding: '20px',
              border: '2px solid red',
              borderRadius: '10px',
              backgroundColor: '#ffe5e5',
            }}
          >
            <h3 style={{ color: 'red', textAlign: 'center' }}>Red Poll</h3>
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
                  name="red.startRow"
                  value={pollInputs['red']['startRow']}
                  onChange={handleInputChange}
                  style={{ width: '50px', marginRight: '10px' }}
                />
              </div>
              <div>
                <label>Start Col: </label>
                <input
                  type="number"
                  name="red.startCol"
                  value={pollInputs['red']['startCol']}
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
                  name="red.endRow"
                  value={pollInputs['red']['endRow']}
                  onChange={handleInputChange}
                  style={{ width: '50px', marginRight: '10px' }}
                />
              </div>
              <div>
                <label>End Col: </label>
                <input
                  type="number"
                  name="red.endCol"
                  value={pollInputs['red']['endCol']}
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
                  setSettingPollRegion('red');
                }}
                color={'red'}
                disabled={settingPollRegion === 'red'}
              >
                Set poll region
              </Button>
              <Button
                onClick={() => handleConductPoll('red')}
                color={'red'}
                clicked={players.red.phaseAction === 'conductPoll'}
              >
                Conduct Poll
              </Button>
            </div>
          </div>

          {/* Blue Polling Column */}
          <div
            style={{
              width: '45%',
              padding: '20px',
              border: '2px solid blue',
              borderRadius: '10px',
              backgroundColor: '#e5e5ff',
            }}
          >
            <h3 style={{ color: 'blue', textAlign: 'center' }}>Blue Poll</h3>
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
                  name="blue.startRow"
                  value={pollInputs['blue']['startRow']}
                  onChange={handleInputChange}
                  style={{ width: '50px', marginRight: '10px' }}
                />
              </div>
              <div>
                <label>Start Col: </label>
                <input
                  type="number"
                  name="blue.startCol"
                  value={pollInputs['blue']['startCol']}
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
                  name="blue.endRow"
                  value={pollInputs['blue']['endRow']}
                  onChange={handleInputChange}
                  style={{ width: '50px', marginRight: '10px' }}
                />
              </div>
              <div>
                <label>End Col: </label>
                <input
                  type="number"
                  name="blue.endCol"
                  value={pollInputs['blue']['endCol']}
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
                  setSettingPollRegion('blue');
                }}
                color={'blue'}
                disabled={settingPollRegion === 'blue'}
              >
                Set poll region
              </Button>
              <Button
                onClick={() => handleConductPoll('blue')}
                color={'blue'}
                clicked={players.blue.phaseAction === 'conductPoll'}
              >
                Conduct Poll
              </Button>
            </div>
          </div>
        </div>
      )}
      {phaseNumber === 3 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '20px',
          }}
        >
          {/* Red Fact-Checking Column */}
          <div
            style={{
              width: '45%',
              padding: '20px',
              border: '2px solid red',
              borderRadius: '10px',
              backgroundColor: '#ffe5e5',
            }}
          >
            <h3 style={{ color: 'red', textAlign: 'center' }}>
              Red Fact-Checking
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
              <Button
                onClick={() => setPhaseAction('red', 'trust')}
                color={'green'}
                clicked={players.red.phaseAction === 'trust'}
              >
                Trust
              </Button>
              <Button
                onClick={() => setPhaseAction('red', 'doubt')}
                color={'orange'}
                clicked={players.red.phaseAction === 'doubt'}
              >
                Doubt
              </Button>
              <Button
                onClick={() => setPhaseAction('red', 'accuse')}
                color={'red'}
                clicked={players.red.phaseAction === 'accuse'}
              >
                Accuse
              </Button>
            </div>
          </div>

          {/* Blue Fact-Checking Column */}
          <div
            style={{
              width: '45%',
              padding: '20px',
              border: '2px solid blue',
              borderRadius: '10px',
              backgroundColor: '#e5e5ff',
            }}
          >
            <h3 style={{ color: 'blue', textAlign: 'center' }}>
              Blue Fact-Checking
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
              <Button
                onClick={() => setPhaseAction('blue', 'trust')}
                color={'green'}
                clicked={players.blue.phaseAction === 'trust'}
              >
                Trust
              </Button>
              <Button
                onClick={() => setPhaseAction('blue', 'doubt')}
                color={'orange'}
                clicked={players.blue.phaseAction === 'doubt'}
              >
                Doubt
              </Button>
              <Button
                onClick={() => setPhaseAction('blue', 'accuse')}
                color={'red'}
                clicked={players.blue.phaseAction === 'accuse'}
              >
                Accuse
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HUD;
