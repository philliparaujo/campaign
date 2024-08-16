import { useEffect, useState } from 'react';
import BoardUI from '../components/Board';
import Button from '../components/Button';
import HUD from '../components/HUD';
import PublicOpinion from '../components/PublicOpinion';
import Scoreboard from '../components/Scoreboard';
import { size, useGameState } from '../GameState';
import { useGlobalState } from '../GlobalState';
import { GameId, PlayerColor, PlayerId, PollRegion } from '../types';

type GameProps = {
  playerId: PlayerId;
  gameId: GameId;
};

const Game: React.FC<GameProps> = ({ playerId, gameId }) => {
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

  const [playerColor, setPlayerColor] = useState<PlayerColor | null>(null);

  const { updateGame, fetchGame } = useGlobalState();
  const { gameState, setGameState } = useGameState();

  // Set and display color of player
  useEffect(() => {
    setPlayerColor(gameState.players.red.id === playerId ? 'red' : 'blue');
  }, [gameState, playerId]);

  const handleEndTurn = async () => {
    try {
      await updateGame(gameId, gameState);
    } catch (error) {
      console.error('Error updating the game state:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      const gameState = await fetchGame(gameId);
      setGameState(gameState);
      console.log('Game state successfully updated!');
    } catch (error) {
      console.error('Error updating the game state:', error);
    }
  };

  return (
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
          <p
            style={{ color: playerColor ?? 'black' }}
          >{`Player ID: ${playerId}`}</p>
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
          <Button onClick={handleEndTurn}>End Turn</Button>
          <Button onClick={handleRefresh}>Refresh</Button>
        </div>
      </div>
    </div>
  );
};

export default Game;
