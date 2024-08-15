import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BoardUI from '../components/Board';
import HUD from '../components/HUD';
import PublicOpinion from '../components/PublicOpinion';
import Scoreboard from '../components/Scoreboard';
import { GameStateProvider, size } from '../GameState';
import { PlayerColor, PollRegion } from '../types';

import { v4 as uuidv4 } from 'uuid';

function Game() {
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
  const [gameId, setGameId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    let idFromUrl = queryParams.get('playerId');
    const gameId = queryParams.get('gameId');

    if (!gameId) {
      console.error('No Game ID found in the URL.');
      return;
    }

    if (!idFromUrl) {
      idFromUrl = uuidv4();
      queryParams.set('playerId', idFromUrl);
      navigate({ search: queryParams.toString() }, { replace: true });
    }

    setPlayerId(idFromUrl);
    setGameId(gameId);
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
            <p>{`Player ID: ${playerId}`}</p>
            <p>{`Game ID: ${gameId}`}</p>
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

export default Game;
