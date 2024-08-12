import { useState } from 'react';
import BoardUI from './components/Board';
import HUD from './components/HUD';
import Scoreboard from './components/Scoreboard';
import { GameStateProvider, size } from './GameState';
import PublicOpinion from './components/PublicOpinion';

export type PollInput = {
  redStartRow: number;
  redStartCol: number;
  redEndRow: number;
  redEndCol: number;
  blueStartRow: number;
  blueStartCol: number;
  blueEndRow: number;
  blueEndCol: number;
};

function App() {
  const [pollInputs, setPollInputs] = useState<PollInput>({
    redStartRow: 0,
    redStartCol: 0,
    redEndRow: size - 1,
    redEndCol: size - 1,
    blueStartRow: 0,
    blueStartCol: 0,
    blueEndRow: size - 1,
    blueEndCol: size - 1,
  });

  return (
    <GameStateProvider>
      <div
        style={{
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            gap: '50px',
          }}
        >
          {/* Left Side */}
          <div>
            <h1>Campaign</h1>
            <BoardUI pollInputs={pollInputs} />
          </div>

          {/* Right Side */}
          <div style={{ width: '650px' }}>
            <PublicOpinion />
            <HUD pollInputs={pollInputs} setPollInputs={setPollInputs} />
            <Scoreboard />
          </div>
        </div>
      </div>
    </GameStateProvider>
  );
}

export default App;
