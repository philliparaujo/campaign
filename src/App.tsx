import BoardUI from './components/Board';
import HUD from './components/HUD';
import Scoreboard from './components/Scoreboard';
import { GameStateProvider } from './GameState';

export type Influence = '' | 'red' | 'blue';

function App() {
  return (
    <GameStateProvider>
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
          {/* Left Side */}
          <div>
            <BoardUI size={5} />
          </div>

          {/* Right Side */}
          <div>
            <HUD />
            <Scoreboard />
          </div>
        </div>
      </div>
    </GameStateProvider>
  );
}

export default App;
