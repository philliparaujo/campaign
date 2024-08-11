import React from 'react';
import { PollInput } from '../App';
import { size, useGameState } from '../GameState';
import { removeInfluence } from '../utils';
import { getRedSample } from './Scoreboard';

interface HUDProps {
  pollInputs: PollInput;
  setPollInputs: React.Dispatch<React.SetStateAction<PollInput>>;
}

const HUD: React.FC<HUDProps> = ({ pollInputs, setPollInputs }) => {
  const { gameState, setGameState } = useGameState();
  const {
    redPolls,
    bluePolls,
    redCoins,
    blueCoins,
    redPublicOpinion,
    turnNumber,
    board,
    phaseNumber,
    debugMode,
  } = gameState;

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

      let newBoard = prev.board;
      let newRedCoins = prev.redCoins;
      let newBlueCoins = prev.blueCoins;
      let newPublicOpinion = { ...prev.redPublicOpinion[prev.turnNumber] };
      let newTurnNumber = isEndOfTurn
        ? prev.turnNumber + 1
        : isStartOfTurn
          ? Math.max(prev.turnNumber - 1, 0)
          : prev.turnNumber;

      // Calculate redPublicOpinion if moving to phase 3
      if (
        newPhaseNumber === 3 &&
        prev.redPolls.length > prev.turnNumber &&
        prev.bluePolls.length > prev.turnNumber
      ) {
        const currentTurn = prev.turnNumber;
        const previousTurn = Math.max(currentTurn - 1, 0);

        const averageOpinion =
          (prev.redPolls[currentTurn].redPercent +
            prev.bluePolls[currentTurn].redPercent +
            prev.redPolls[previousTurn].redPercent +
            prev.bluePolls[previousTurn].redPercent) /
          4;

        // Update the opinion for phase 3
        newPublicOpinion.redPublicOpinion[newPhaseNumber - 1] = averageOpinion;
      }

      // Carry forward the opinion from phase 3 to phase 4
      if (newPhaseNumber === 4) {
        newBoard = removeInfluence(prev.board);
        const currentOpinion = newPublicOpinion.redPublicOpinion[2] || 50; // Use phase 3 value or 50 if undefined

        newRedCoins = 10 + Math.floor(currentOpinion / 10);
        newBlueCoins = 10 + Math.floor((100 - currentOpinion) / 10);

        // Set the trueRedPercent to the value carried over from phase 3
        newPublicOpinion.trueRedPercent = currentOpinion;
        newPublicOpinion.redPublicOpinion[newPhaseNumber - 1] = currentOpinion; // Update phase 4 value
      } else {
        newPublicOpinion.trueRedPercent = null;
      }

      // Ensure redPublicOpinion array has the correct length
      const updatedPublicOpinion = prev.redPublicOpinion.map(
        (opinion, index) =>
          index === newTurnNumber ? newPublicOpinion : opinion
      );

      // If end of turn, add a new entry for the next turn
      if (isEndOfTurn) {
        const lastOpinion =
          updatedPublicOpinion[prev.turnNumber]['redPublicOpinion'][
            prev.phaseNumber - 1
          ];
        updatedPublicOpinion.push({
          redPublicOpinion: [
            lastOpinion,
            lastOpinion,
            lastOpinion,
            lastOpinion,
          ], // Initialize for next turn
          trueRedPercent: null,
        });
      }

      console.log(redPublicOpinion);

      return {
        ...prev,
        redCoins: newRedCoins,
        blueCoins: newBlueCoins,
        board: newBoard,
        phaseNumber: newPhaseNumber,
        turnNumber: newTurnNumber,
        redPublicOpinion: updatedPublicOpinion,
      };
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPollInputs(prevInputs => ({
      ...prevInputs,
      [name]: Math.min(Math.max(Number(value), 0), size - 1), // Ensure the value is stored as a number
    }));
  };

  const handleConductPoll = (color: 'red' | 'blue') => {
    const startRow = pollInputs[`${color}StartRow`];
    const endRow = pollInputs[`${color}EndRow`];
    const startCol = pollInputs[`${color}StartCol`];
    const endCol = pollInputs[`${color}EndCol`];

    const redPercent = getRedSample(board, startRow, endRow, startCol, endCol);
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

  /* Do nothing */
  const handleTrustPoll = (pollColor: 'red' | 'blue') => {};

  /* If poll within 5% of true value, lose 5% public opinion;
     otherwise, gain 5% public opinion. */
  const handleDoubtPoll = (pollColor: 'red' | 'blue') => {
    let truePercent = getRedSample(board, 0, size - 1, 0, size - 1, true);
    let poll =
      pollColor === 'red' ? redPolls[turnNumber] : bluePolls[turnNumber];
    let pollPercent = poll['redPercent'];

    console.log(truePercent, pollPercent);

    let publicOpinion = redPublicOpinion;
    let currentPublicOpinion =
      publicOpinion[turnNumber]['redPublicOpinion'][phaseNumber - 1];

    if (Math.abs(pollPercent - truePercent) < 5) {
      pollColor === 'red'
        ? (currentPublicOpinion += 5)
        : (currentPublicOpinion -= 5);
    } else {
      pollColor === 'red'
        ? (currentPublicOpinion -= 5)
        : (currentPublicOpinion += 5);
    }

    publicOpinion[turnNumber]['redPublicOpinion'][phaseNumber - 1] =
      currentPublicOpinion;
    setGameState(prev => ({
      ...prev,
      redPublicOpinion: publicOpinion,
    }));
  };

  const handleAccusePoll = (pollColor: 'red' | 'blue') => {
    let truePercent = getRedSample(board, 0, size - 1, 0, size - 1, true);
    let poll =
      pollColor === 'red' ? redPolls[turnNumber] : bluePolls[turnNumber];
    let pollPercent = poll['redPercent'];

    let publicOpinion = redPublicOpinion;
    let newPublicOpinion;

    if (Math.abs(pollPercent - truePercent) > 10) {
      newPublicOpinion =
        pollColor === 'red'
          ? (bluePolls[turnNumber]['redPercent'] +
              redPolls[turnNumber - 1]['redPercent'] +
              bluePolls[turnNumber - 1]['redPercent']) /
            3
          : (redPolls[turnNumber]['redPercent'] +
              redPolls[turnNumber - 1]['redPercent'] +
              bluePolls[turnNumber - 1]['redPercent']) /
            3;
      newPublicOpinion =
        pollColor === 'red'
          ? Math.min(
              newPublicOpinion,
              redPublicOpinion[turnNumber]['redPublicOpinion'][
                phaseNumber - 1
              ] - 10
            )
          : Math.max(
              newPublicOpinion,
              redPublicOpinion[turnNumber]['redPublicOpinion'][
                phaseNumber - 1
              ] + 10
            );
    } else {
      newPublicOpinion =
        pollColor === 'red'
          ? redPublicOpinion[turnNumber]['redPublicOpinion'][phaseNumber - 1] +
            10
          : redPublicOpinion[turnNumber]['redPublicOpinion'][phaseNumber - 1] -
            10;
    }

    publicOpinion[turnNumber]['redPublicOpinion'][phaseNumber - 1] =
      newPublicOpinion;

    setGameState(prev => ({
      ...prev,
      redPublicOpinion: publicOpinion,
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
              <button style={buttonStyle} onClick={() => changeRedCoins(1)}>
                +
              </button>
            )}
            <span style={{ margin: '0 10px' }}>{redCoins}</span>
            {debugMode && (
              <button style={buttonStyle} onClick={() => changeRedCoins(-1)}>
                -
              </button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginRight: '20px' }}>
          <h3 style={{ color: '#6666ff', margin: '5px' }}>Blue Coins</h3>
          <div>
            {debugMode && (
              <button style={buttonStyle} onClick={() => changeBlueCoins(1)}>
                +
              </button>
            )}
            <span style={{ margin: '0 10px' }}>{blueCoins}</span>
            {debugMode && (
              <button style={buttonStyle} onClick={() => changeBlueCoins(-1)}>
                -
              </button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginRight: '20px' }}>
          <h3 style={{ margin: '5px' }}>Turn Number</h3>
          <div>
            {debugMode && (
              <button style={buttonStyle} onClick={() => changeTurnNumber(1)}>
                +
              </button>
            )}
            <span style={{ margin: '0 10px' }}>{turnNumber}</span>
            {debugMode && (
              <button style={buttonStyle} onClick={() => changeTurnNumber(-1)}>
                -
              </button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '5px' }}>Phase Number</h3>
          <div>
            <button style={buttonStyle} onClick={() => changePhaseNumber(1)}>
              Next
            </button>
            <span style={{ margin: '0 10px' }}>{phaseNumber}</span>
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
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <button
                style={{ ...buttonStyle, backgroundColor: 'green' }}
                onClick={() => handleTrustPoll('blue')}
              >
                Trust
              </button>
              <button
                style={{ ...buttonStyle, backgroundColor: '#ff8500' }}
                onClick={() => handleDoubtPoll('blue')}
              >
                Doubt
              </button>
              <button
                style={{ ...buttonStyle, backgroundColor: 'red' }}
                onClick={() => handleAccusePoll('blue')}
              >
                Accuse
              </button>
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
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <button
                style={{ ...buttonStyle, backgroundColor: 'green' }}
                onClick={() => handleTrustPoll('red')}
              >
                Trust
              </button>
              <button
                style={{ ...buttonStyle, backgroundColor: '#ff8500' }}
                onClick={() => handleDoubtPoll('red')}
              >
                Doubt
              </button>
              <button
                style={{ ...buttonStyle, backgroundColor: 'red' }}
                onClick={() => handleAccusePoll('red')}
              >
                Accuse
              </button>
            </div>
          </div>
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
