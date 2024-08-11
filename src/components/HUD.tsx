import React, { useState } from 'react';
import { useGameState } from '../GameState';
import { getRedSample } from './Scoreboard';

interface HUDProps {}

const HUD: React.FC<HUDProps> = () => {
  const { gameState, setGameState } = useGameState();

  const [pollInputs, setPollInputs] = useState({
    redStartRow: 0,
    redStartCol: 0,
    redEndRow: 0,
    redEndCol: 0,
    blueStartRow: 0,
    blueStartCol: 0,
    blueEndRow: 0,
    blueEndCol: 0,
  });

  const changeRedCoins = (change: number) => {
    setGameState(prev => ({ ...prev, redCoins: prev.redCoins + change }));
  };

  const changeBlueCoins = (change: number) => {
    setGameState(prev => ({ ...prev, blueCoins: prev.blueCoins + change }));
  };

  const changeTurnNumber = (change: number) => {
    setGameState(prev => ({
      ...prev,
      turnNumber: Math.max(0, prev.turnNumber + change),
    }));
  };

  const changePhaseNumber = (change: number) => {
    setGameState(prev => {
      let newPhaseNumber = prev.phaseNumber + change;

      if (newPhaseNumber > 4) {
        newPhaseNumber = 1;
      } else if (newPhaseNumber < 1) {
        newPhaseNumber = 4;
      }

      const isEndOfTurn = prev.phaseNumber === 4 && change === 1;
      const isStartOfTurn = prev.phaseNumber === 1 && change === -1;

      return {
        ...prev,
        phaseNumber: newPhaseNumber,
        turnNumber: isEndOfTurn
          ? prev.turnNumber + 1
          : isStartOfTurn
            ? prev.turnNumber - 1
            : prev.turnNumber,
      };
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPollInputs(prevInputs => ({
      ...prevInputs,
      [name]: Number(value), // Ensure the value is stored as a number
    }));
  };

  const handleConductPoll = (color: 'red' | 'blue') => {
    const startRow = pollInputs[`${color}StartRow`];
    const endRow = pollInputs[`${color}EndRow`];
    const startCol = pollInputs[`${color}StartCol`];
    const endCol = pollInputs[`${color}EndCol`];

    const redPercent = getRedSample(
      gameState.board,
      startRow,
      endRow,
      startCol,
      endCol
    );
    const newPoll = {
      startRow,
      endRow,
      startCol,
      endCol,
      redPercent,
    };
    if (color === 'red') {
      setGameState(prev => ({
        ...prev,
        redPolls: [...prev.redPolls, newPoll],
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        bluePolls: [...prev.bluePolls, newPoll],
      }));
    }
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
            <button style={buttonStyle} onClick={() => changeRedCoins(1)}>
              +
            </button>
            <span style={{ margin: '0 10px' }}>{gameState.redCoins}</span>
            <button style={buttonStyle} onClick={() => changeRedCoins(-1)}>
              -
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginRight: '20px' }}>
          <h3 style={{ color: '#6666ff', margin: '5px' }}>Blue Coins</h3>
          <div>
            <button style={buttonStyle} onClick={() => changeBlueCoins(1)}>
              +
            </button>
            <span style={{ margin: '0 10px' }}>{gameState.blueCoins}</span>
            <button style={buttonStyle} onClick={() => changeBlueCoins(-1)}>
              -
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginRight: '20px' }}>
          <h3 style={{ margin: '5px' }}>Turn Number</h3>
          <div>
            <button style={buttonStyle} onClick={() => changeTurnNumber(1)}>
              +
            </button>
            <span style={{ margin: '0 10px' }}>{gameState.turnNumber}</span>
            <button style={buttonStyle} onClick={() => changeTurnNumber(-1)}>
              -
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '5px' }}>Phase Number</h3>
          <div>
            <button style={buttonStyle} onClick={() => changePhaseNumber(1)}>
              Next
            </button>
            <span style={{ margin: '0 10px' }}>{gameState.phaseNumber}</span>
            <button style={buttonStyle} onClick={() => changePhaseNumber(-1)}>
              Prev
            </button>
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
        <b>Phase {gameState.phaseNumber}:</b>{' '}
        {phaseDescriptions[gameState.phaseNumber]}
      </div>

      {/* Turn actions */}
      {gameState.phaseNumber === 2 && (
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
            <button
              style={{ ...buttonStyle, backgroundColor: 'red' }}
              onClick={() => handleConductPoll('red')}
            >
              Conduct Poll
            </button>
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
            <button
              style={{ ...buttonStyle, backgroundColor: 'blue' }}
              onClick={() => handleConductPoll('blue')}
            >
              Conduct Poll
            </button>
          </div>
        </div>
      )}
      {gameState.phaseNumber === 3 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '10px',
          }}
        >
          <button style={buttonStyle} onClick={() => changePhaseNumber(1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '5px 10px',
  backgroundColor: '#444',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default HUD;
