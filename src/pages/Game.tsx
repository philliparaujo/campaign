import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BoardUI from '../components/Board';
import Button from '../components/Button';
import HUD from '../components/HUD';
import PublicOpinion from '../components/PublicOpinion';
import Scoreboard from '../components/Scoreboard';
import { size, useGameState } from '../GameState';
import { useGlobalState } from '../GlobalState';
import { GameId, GameState, PlayerColor, PlayerId, PollRegion } from '../types';
import { opponentOf } from '../utils';
import { io } from 'socket.io-client';

type GameProps = {
  gameId: GameId;
  playerId: PlayerId;
  playerColor: PlayerColor;
};

const socket = io('http://localhost:5000');

const Game: React.FC<GameProps> = ({ gameId, playerId, playerColor }) => {
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
  const [opponentId, setOpponentId] = useState<PlayerId | null>(null);

  const { leaveGame, updateGame, fetchGame, setupListener, fetchOpponentOf } =
    useGlobalState();
  const { gameState, setGameState } = useGameState();
  const navigate = useNavigate();

  const handleEndTurn = async () => {
    try {
      await updateGame(gameId, gameState);
    } catch (error) {
      console.error('Error updating the game state:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    try {
      const gameState = await fetchGame(gameId);
      setGameState(gameState);
      console.log('Game state successfully updated!');
    } catch (error) {
      console.error('Error updating the game state:', error);
    }
  }, [fetchGame, gameId, setGameState]);

  const handleOpponentJoin = useCallback(async () => {
    try {
      const opponentId = await fetchOpponentOf(playerId);
      setOpponentId(opponentId);
    } catch (error) {
      console.error('Error fetching opponent id:', error);
    }
  }, [fetchOpponentOf, playerId, setOpponentId]);

  const handleLeaveGame = async () => {
    try {
      await leaveGame(gameId, playerId);
      navigate('/');
    } catch (error) {
      console.error('Error leaving the game:', error);
    }
  };

  // Listen and react to game events
  useEffect(() => {
    const removeGameJoinedListener = setupListener(
      'gameJoined',
      handleOpponentJoin
    );
    const removeGameUpdatedListener = setupListener(
      'gameUpdated',
      handleRefresh
    );

    // Cleanup listeners on unmount
    return () => {
      removeGameUpdatedListener();
      removeGameJoinedListener();
    };
  }, [setupListener, handleRefresh, handleOpponentJoin]);

  // On load, set opponent id if it exists
  useEffect(() => {
    fetchOpponentOf(playerId).then(opponent => {
      setOpponentId(opponent);
    });
  });

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
          <p style={{ color: playerColor }}>{`Player ID: ${playerId}`}</p>
          {opponentId && (
            <p
              style={{ color: opponentOf(playerColor) }}
            >{`Opponent ID: ${opponentId}`}</p>
          )}
          <p>{`Game ID: ${gameId}`}</p>
          <BoardUI
            playerColor={playerColor}
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
            playerColor={playerColor}
            pollInputs={pollInputs}
            setPollInputs={setPollInputs}
            settingPollRegion={settingPollRegion}
            setSettingPollRegion={setSettingPollRegion}
          />
          <Scoreboard
            playerColor={playerColor}
            showRoadInfluence={showRoadInfluence}
            setShowRoadInfluence={setShowRoadInfluence}
          />
          <Button onClick={handleEndTurn}>End Turn</Button>
          {/* <Button onClick={handleRefresh}>Refresh</Button> */}
          <Button onClick={handleLeaveGame}>Leave Game</Button>
        </div>
      </div>
    </div>
  );
};

export default Game;
