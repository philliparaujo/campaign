import { useEffect, useState } from 'react';
import BoardUI from './components/Board';
import HUD from './components/HUD';
import PublicOpinion from './components/PublicOpinion';
import Scoreboard from './components/Scoreboard';
import { GameStateProvider, size } from './GameState';
import { PlayerColor, PollRegion } from './types';
import { useLocation, useNavigate } from 'react-router-dom';

import { v4 as uuidv4 } from 'uuid';

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

  const [playerId, setPlayerId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    let idFromUrl = queryParams.get('playerId');

    if (!idFromUrl) {
      idFromUrl = uuidv4();
      queryParams.set('playerId', idFromUrl);
      navigate({ search: queryParams.toString() }, { replace: true });
    }

    setPlayerId(idFromUrl);
  }, [location.search, navigate]);

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
            {playerId}
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
