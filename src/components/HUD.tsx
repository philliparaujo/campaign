import React from 'react';
import { useGameState } from '../GameState';

interface HUDProps {}

const HUD: React.FC<HUDProps> = () => {
  const { gameState, setGameState } = useGameState();

  const changeRedCoins = (change: number) => {
    setGameState(prev => ({ ...prev, redCoins: prev.redCoins + change }));
  };

  const changeBlueCoins = (change: number) => {
    setGameState(prev => ({ ...prev, blueCoins: prev.blueCoins + change }));
  };

  const changeTurnNumber = (change: number) => {
    setGameState(prev => ({
      ...prev,
      turnNumber: prev.turnNumber === 4 ? 1 : prev.turnNumber + change,
    }));
  };

  const changePhaseNumber = (change: number) => {
    setGameState(prev => ({
      ...prev,
      phaseNumber: prev.phaseNumber === 4 ? 1 : prev.phaseNumber + change,
    }));
  };

  const phaseDescriptions: { [key: number]: string } = {
    1: 'Advertising',
    2: 'Polling',
    3: 'Fact-Checking',
    4: 'Funding',
  };

  return (
    <div style={{ width: '100%', marginBottom: '20px' }}>
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
