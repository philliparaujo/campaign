import React from 'react';
import { size, useGameState } from '../GameState';
import { PlayerColor, PollInput } from '../types';
import { canEndPhase, getRedSample } from '../utils';
import Button from './Button';

interface HUDProps {
  pollInputs: PollInput;
  setPollInputs: React.Dispatch<React.SetStateAction<PollInput>>;
  setShowRoadInfluence: React.Dispatch<React.SetStateAction<boolean>>;
}

const HUD: React.FC<HUDProps> = ({ pollInputs, setPollInputs }) => {
  const {
    gameState,
    setRedCoins,
    setBlueCoins,
    setTurnNumber,
    setPhaseAction,
    savePoll,
    incrementPhaseNumber,
  } = useGameState();
  const {
    redCoins,
    blueCoins,
    turnNumber,
    board,
    phaseNumber,
    phaseActions,
    debugMode,
  } = gameState;

  // Update poll boundary variables when any input's value changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPollInputs(prevInputs => ({
      ...prevInputs,
      [name]: Math.min(Math.max(Number(value), 0), size - 1),
    }));
  };

  // Sample a population within your boundary and save your poll result
  const handleConductPoll = (pollColor: PlayerColor) => {
    const startRow = pollInputs[`${pollColor}StartRow`];
    const endRow = pollInputs[`${pollColor}EndRow`];
    const startCol = pollInputs[`${pollColor}StartCol`];
    const endCol = pollInputs[`${pollColor}EndCol`];

    const redPercent = getRedSample(board, startRow, endRow, startCol, endCol);

    savePoll(pollColor, {
      startRow,
      endRow,
      startCol,
      endCol,
      redPercent,
    });
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
              <Button onClick={() => setRedCoins(redCoins + 1)} size={'small'}>
                +
              </Button>
            )}
            <span style={{ margin: '0 10px' }}>{redCoins}</span>
            {debugMode && (
              <Button onClick={() => setRedCoins(redCoins - 1)} size={'small'}>
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
                onClick={() => setBlueCoins(blueCoins + 1)}
                size={'small'}
              >
                +
              </Button>
            )}
            <span style={{ margin: '0 10px' }}>{blueCoins}</span>
            {debugMode && (
              <Button
                onClick={() => setBlueCoins(blueCoins - 1)}
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
                  name="redStartRow"
                  value={pollInputs.redStartRow}
                  onChange={handleInputChange}
                  style={{ width: '50px', marginRight: '10px' }}
                />
              </div>
              <div>
                <label>Start Col: </label>
                <input
                  type="number"
                  name="redStartCol"
                  value={pollInputs.redStartCol}
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
                  name="redEndRow"
                  value={pollInputs.redEndRow}
                  onChange={handleInputChange}
                  style={{ width: '50px', marginRight: '10px' }}
                />
              </div>
              <div>
                <label>End Col: </label>
                <input
                  type="number"
                  name="redEndCol"
                  value={pollInputs.redEndCol}
                  onChange={handleInputChange}
                  style={{ width: '50px', marginRight: '10px' }}
                />
              </div>
            </div>
            <Button
              onClick={() => handleConductPoll('red')}
              color={'red'}
              clicked={phaseActions['red'] === 'conductPoll'}
            >
              Conduct Poll
            </Button>
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
                  name="blueStartRow"
                  value={pollInputs.blueStartRow}
                  onChange={handleInputChange}
                  style={{ width: '50px', marginRight: '10px' }}
                />
              </div>
              <div>
                <label>Start Col: </label>
                <input
                  type="number"
                  name="blueStartCol"
                  value={pollInputs.blueStartCol}
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
                  name="blueEndRow"
                  value={pollInputs.blueEndRow}
                  onChange={handleInputChange}
                  style={{ width: '50px', marginRight: '10px' }}
                />
              </div>
              <div>
                <label>End Col: </label>
                <input
                  type="number"
                  name="blueEndCol"
                  value={pollInputs.blueEndCol}
                  onChange={handleInputChange}
                  style={{ width: '50px', marginRight: '10px' }}
                />
              </div>
            </div>
            <Button
              onClick={() => handleConductPoll('blue')}
              color={'blue'}
              clicked={phaseActions['blue'] === 'conductPoll'}
            >
              Conduct Poll
            </Button>
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
                clicked={phaseActions['red'] === 'trust'}
              >
                Trust
              </Button>
              <Button
                onClick={() => setPhaseAction('red', 'doubt')}
                color={'orange'}
                clicked={phaseActions['red'] === 'doubt'}
              >
                Doubt
              </Button>
              <Button
                onClick={() => setPhaseAction('red', 'accuse')}
                color={'red'}
                clicked={phaseActions['red'] === 'accuse'}
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
                clicked={phaseActions['blue'] === 'trust'}
              >
                Trust
              </Button>
              <Button
                onClick={() => setPhaseAction('blue', 'doubt')}
                color={'orange'}
                clicked={phaseActions['blue'] === 'doubt'}
              >
                Doubt
              </Button>
              <Button
                onClick={() => setPhaseAction('blue', 'accuse')}
                color={'red'}
                clicked={phaseActions['blue'] === 'accuse'}
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
