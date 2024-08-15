import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BoardUI from '../components/Board';
import HUD from '../components/HUD';
import PublicOpinion from '../components/PublicOpinion';
import Scoreboard from '../components/Scoreboard';
import { GameStateProvider, size } from '../GameState';
import { useGlobalState } from '../GlobalState';
import { GameId, PlayerColor, PlayerId, PollRegion } from '../types';

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

  const [playerId, setPlayerId] = useState<PlayerId>('');
  const [gameId, setGameId] = useState<GameId>('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const playerId = queryParams.get('playerId');
    const gameId = queryParams.get('gameId');

    if (!playerId) {
      console.error('No Player ID found in the URL.');
      return;
    }

    if (!gameId) {
      console.error('No Game ID found in the URL.');
      return;
    }

    setPlayerId(playerId);
    setGameId(gameId);
  }, [location.search, navigate]);

  const { playerGames, activeGames } = useGlobalState();
  console.log('player games: ', playerGames);
  console.log('active games: ', activeGames);

  return (
    <GameStateProvider gameId={gameId}>
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
