import { useState } from 'react';
import BoardUI from './components/Board';
import HUD from './components/HUD';
import PublicOpinion from './components/PublicOpinion';
import Scoreboard from './components/Scoreboard';
import { GameStateProvider, size } from './GameState';
import { PlayerColor, PollRegion } from './types';

function App() {
  const defaultPollRegion: PollRegion = {
    startRow: 0,
    endRow: size - 1,
    startCol: 0,
    endCol: size - 1,
  };

  const [pollInputs, setPollInputs] = useState<Record<PlayerColor, PollRegion>>(
    {
      red: defaultPollRegion,
      blue: defaultPollRegion,
    }
  );
  const [showRoadInfluence, setShowRoadInfluence] = useState<boolean>(false);
  const [settingPollRegion, setSettingPollRegion] =
    useState<PlayerColor | null>(null);

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
            gap: '80px',
          }}
        >
          {/* Left Side */}
          <div>
            <h1 style={{ paddingBottom: '35px' }}>Campaign</h1>
            <BoardUI
              pollInputs={pollInputs}
              setPollInputs={setPollInputs}
              showRoadInfluence={showRoadInfluence}
              settingPollRegion={settingPollRegion}
              setSettingPollRegion={setSettingPollRegion}
            />
          </div>

          {/* Right Side */}
          <div style={{ width: '650px' }}>
            <PublicOpinion />
            <HUD
              pollInputs={pollInputs}
              setPollInputs={setPollInputs}
              settingPollRegion={settingPollRegion}
              setSettingPollRegion={setSettingPollRegion}
            />
            <Scoreboard
              showRoadInfluence={showRoadInfluence}
              setShowRoadInfluence={setShowRoadInfluence}
            />
          </div>
        </div>
      </div>
    </GameStateProvider>
  );
}

export default App;
