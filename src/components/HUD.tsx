import React from 'react';

interface HUDProps {
  redCoins: number;
  blueCoins: number;
  turnNumber: number;
  phaseNumber: number;
  setRedCoins: React.Dispatch<React.SetStateAction<number>>;
  setBlueCoins: React.Dispatch<React.SetStateAction<number>>;
  setTurnNumber: React.Dispatch<React.SetStateAction<number>>;
  setPhaseNumber: React.Dispatch<React.SetStateAction<number>>;
}

const HUD: React.FC<HUDProps> = ({
  redCoins,
  blueCoins,
  turnNumber,
  phaseNumber,
  setRedCoins,
  setBlueCoins,
  setTurnNumber,
  setPhaseNumber,
}) => {
  const increasePhase = () =>
    setPhaseNumber(prev => (prev === 4 ? 1 : prev + 1));
  const decreasePhase = () =>
    setPhaseNumber(prev => (prev === 1 ? 4 : prev - 1));

  const phaseDescriptions: { [key: number]: string } = {
    1: 'Advertising',
    2: 'Polling',
    3: 'Fact-Checking',
    4: 'Funding',
  };
  const currentPhaseDescription = phaseDescriptions[phaseNumber];

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
            <button
              style={buttonStyle}
              onClick={() => setRedCoins(prev => prev + 1)}
            >
              +
            </button>
            <span style={{ margin: '0 10px' }}>{redCoins}</span>
            <button
              style={buttonStyle}
              onClick={() => setRedCoins(prev => (prev > 0 ? prev - 1 : 0))}
            >
              -
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginRight: '20px' }}>
          <h3 style={{ color: '#6666ff', margin: '5px' }}>Blue Coins</h3>
          <div>
            <button
              style={buttonStyle}
              onClick={() => setBlueCoins(prev => prev + 1)}
            >
              +
            </button>
            <span style={{ margin: '0 10px' }}>{blueCoins}</span>
            <button
              style={buttonStyle}
              onClick={() => setBlueCoins(prev => (prev > 0 ? prev - 1 : 0))}
            >
              -
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginRight: '20px' }}>
          <h3 style={{ margin: '5px' }}>Turn Number</h3>
          <div>
            <button
              style={buttonStyle}
              onClick={() => setTurnNumber(prev => prev + 1)}
            >
              +
            </button>
            <span style={{ margin: '0 10px' }}>{turnNumber}</span>
            <button
              style={buttonStyle}
              onClick={() => setTurnNumber(prev => (prev > 1 ? prev - 1 : 1))}
            >
              -
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '5px' }}>Phase Number</h3>
          <div>
            <button style={buttonStyle} onClick={increasePhase}>
              Next
            </button>
            <span style={{ margin: '0 10px' }}>{phaseNumber}</span>
            <button style={buttonStyle} onClick={decreasePhase}>
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
        <b>Phase {phaseNumber}:</b> {currentPhaseDescription}
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
