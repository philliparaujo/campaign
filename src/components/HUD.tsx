import React from 'react';
import { PollInput } from '../App';
import { Opinion, size, useGameState } from '../GameState';
import { calculatePublicOpinion, removeInfluence } from '../utils';
import { getRedSample } from './Scoreboard';
import Button from './Button';

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

  const incrementPhaseNumber = () => {
    setGameState(prev => {
      // define new variables
      let newBoard = prev.board;
      let newRedCoins = prev.redCoins;
      let newBlueCoins = prev.blueCoins;
      let newPhaseNumber = prev.phaseNumber + 1;
      let newTurnNumber = prev.turnNumber;
      let newRedPublicOpinion: Opinion[] = prev.redPublicOpinion.map(
        opinion => ({
          trueRedPercent: opinion.trueRedPercent,
          redPublicOpinion: [...opinion.redPublicOpinion],
        })
      );
      let newRedPolls = [...prev.redPolls];
      let newBluePolls = [...prev.bluePolls];

      const lastOpinion =
        newRedPublicOpinion[prev.turnNumber]['redPublicOpinion'][
          prev.phaseNumber - 1
        ];

      /* End phase 2: calculate new public opinion from published polls */
      if (prev.phaseNumber === 2) {
        // Check if both redPolls and bluePolls have enough entries

        // Add a dummy poll if either poll length is not sufficient
        if (prev.redPolls.length <= prev.turnNumber) {
          const dummyPoll = {
            startRow: 0,
            endRow: size - 1,
            startCol: 0,
            endCol: size - 1,
            redPercent: 50,
          };
          newRedPolls.push(dummyPoll);
        }

        if (prev.bluePolls.length <= prev.turnNumber) {
          const dummyPoll = {
            startRow: 0,
            endRow: size - 1,
            startCol: 0,
            endCol: size - 1,
            redPercent: 50,
          };
          newBluePolls.push(dummyPoll);
        }

        // Calculate and store the average opinion
        const averageOpinion = calculatePublicOpinion(
          newRedPolls,
          newBluePolls,
          prev.turnNumber
        );
        newRedPublicOpinion[newTurnNumber]['redPublicOpinion'][
          newPhaseNumber - 1
        ] = averageOpinion;
      } else {
        // If not phase 2, simply carry forward the last opinion
        newRedPublicOpinion[newTurnNumber]['redPublicOpinion'][
          newPhaseNumber - 1
        ] = lastOpinion;
      }

      /* End phase 3: store true poll result, reset coins/ads */
      if (prev.phaseNumber === 3) {
        const redPercent = getRedSample(board, 0, size - 1, 0, size - 1, true);
        newRedPublicOpinion[prev.turnNumber]['trueRedPercent'] = redPercent;

        newBoard = removeInfluence(prev.board);
        newRedCoins = 10 + Math.floor(lastOpinion / 10);
        newBlueCoins = 10 + Math.floor((100 - lastOpinion) / 10);
      }

      /* End phase 4: update phases/turns, opinion storage for next turn */
      if (prev.phaseNumber === 4) {
        newPhaseNumber = 1;
        newTurnNumber++;

        newRedPublicOpinion.push({
          trueRedPercent: null,
          redPublicOpinion: [
            lastOpinion,
            lastOpinion,
            lastOpinion,
            lastOpinion,
          ],
        });
      }

      return {
        ...prev,
        board: newBoard,
        redCoins: newRedCoins,
        blueCoins: newBlueCoins,
        phaseNumber: newPhaseNumber,
        turnNumber: newTurnNumber,
        redPublicOpinion: newRedPublicOpinion,
        redPolls: newRedPolls,
        bluePolls: newBluePolls,
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
          ? calculatePublicOpinion(redPolls, bluePolls, turnNumber, true, false)
          : calculatePublicOpinion(
              redPolls,
              bluePolls,
              turnNumber,
              false,
              true
            );
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
              <Button onClick={() => changeRedCoins(1)} size={'small'}>
                +
              </Button>
            )}
            <span style={{ margin: '0 10px' }}>{redCoins}</span>
            {debugMode && (
              <Button onClick={() => changeRedCoins(-1)} size={'small'}>
                -
              </Button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginRight: '20px' }}>
          <h3 style={{ color: '#6666ff', margin: '5px' }}>Blue Coins</h3>
          <div>
            {debugMode && (
              <Button onClick={() => changeBlueCoins(1)} size={'small'}>
                +
              </Button>
            )}
            <span style={{ margin: '0 10px' }}>{blueCoins}</span>
            {debugMode && (
              <Button onClick={() => changeBlueCoins(-1)} size={'small'}>
                -
              </Button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginRight: '20px' }}>
          <h3 style={{ margin: '5px' }}>Turn Number</h3>
          <div>
            {debugMode && (
              <Button onClick={() => changeTurnNumber(1)} size={'small'}>
                +
              </Button>
            )}
            <span style={{ margin: '0 10px' }}>{turnNumber}</span>
            {debugMode && (
              <Button onClick={() => changeTurnNumber(-1)} size={'small'}>
                -
              </Button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '5px' }}>Phase Number</h3>
          <div>
            <span style={{ margin: '0 10px' }}>{phaseNumber}</span>
            <Button onClick={() => incrementPhaseNumber()} size={'small'}>
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
            <Button onClick={() => handleConductPoll('red')} color={'red'}>
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
            <Button onClick={() => handleConductPoll('blue')} color={'blue'}>
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
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Button onClick={() => handleTrustPoll('blue')} color={'green'}>
                Trust
              </Button>
              <Button onClick={() => handleDoubtPoll('blue')} color={'orange'}>
                Doubt
              </Button>
              <Button onClick={() => handleAccusePoll('blue')} color={'red'}>
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
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Button onClick={() => handleTrustPoll('red')} color={'green'}>
                Trust
              </Button>
              <Button onClick={() => handleDoubtPoll('red')} color={'orange'}>
                Doubt
              </Button>
              <Button onClick={() => handleAccusePoll('red')} color={'red'}>
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
