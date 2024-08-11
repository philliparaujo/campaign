import React, { useState } from 'react';

import BoardUI, { Cell } from './components/Board';
import { initializeBoard } from './utils';
import Scoreboard from './components/Scoreboard';
import HUD from './components/HUD';

export type Influence = '' | 'red' | 'blue';

function App() {
  const [board, setBoard] = useState<Cell[][]>(initializeBoard(5));

  const [redCoins, setRedCoins] = useState(0);
  const [blueCoins, setBlueCoins] = useState(0);
  const [turnNumber, setTurnNumber] = useState(1);
  const [phaseNumber, setPhaseNumber] = useState(1);

  return (
    <div
      style={{
        padding: '40px',
      }}
    >
      <h1>Campaign</h1>
      <div
        style={{
          display: 'flex',
          width: '100%',
          gap: '50px',
        }}
      >
        {/* Left Side: Board and Button */}
        <div>
          <BoardUI size={5} board={board} setBoard={setBoard} />
          <button
            onClick={() => setBoard(initializeBoard(5))}
            style={{ marginTop: '10px' }}
          >
            Regenerate board
          </button>
        </div>

        {/* Right Side: HUD and Scoreboard */}
        <div>
          <HUD
            redCoins={redCoins}
            blueCoins={blueCoins}
            turnNumber={turnNumber}
            phaseNumber={phaseNumber}
            setRedCoins={setRedCoins}
            setBlueCoins={setBlueCoins}
            setTurnNumber={setTurnNumber}
            setPhaseNumber={setPhaseNumber}
          />
          <Scoreboard board={board} />
        </div>
      </div>
    </div>
  );
}

export default App;
