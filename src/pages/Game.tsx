import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BoardUI from '../components/Board';
import Button from '../components/Button';
import HUD from '../components/HUD';
import PublicOpinion from '../components/PublicOpinion';
import Scoreboard from '../components/Scoreboard';
import { size, useGameState } from '../GameState';
import { useGlobalState } from '../GlobalState';
import {
  GameId,
  PlayerColor,
  PlayerGame,
  PlayerId,
  PollRegion,
} from '../types';
import { opponentOf } from '../utils';

type GameProps = {
  gameId: GameId;
  playerId: PlayerId;
  playerGame: PlayerGame;
};

const Game: React.FC<GameProps> = ({ gameId, playerId, playerGame }) => {
  const { playerColor, displayName } = playerGame;

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
  const [opponentDisplayName, setOpponentDisplayName] = useState<string | null>(
    null
  );

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
      const opponentGame = await fetchOpponentOf(playerId);
      if (opponentGame) {
        setOpponentDisplayName(opponentGame.displayName);
      }
    } catch (error) {
      console.error('Error fetching opponent:', error);
    }
  }, [fetchOpponentOf, playerId, setOpponentDisplayName]);

  const handleOpponentLeft = useCallback(async () => {
    try {
      const opponentGame = await fetchOpponentOf(playerId);
      if (!opponentGame) {
        setOpponentDisplayName(null);
      }
    } catch (error) {
      console.error('Error fetching opponent:', error);
    }
  }, [fetchOpponentOf, playerId, setOpponentDisplayName]);

  const handleGameDeleted = useCallback(async () => {
    navigate('/');
  }, [navigate]);

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
    const removeGameLeftListener = setupListener(
      'gameLeft',
      handleOpponentLeft
    );
    const removeGameUpdatedListener = setupListener(
      'gameUpdated',
      handleRefresh
    );
    const removeGameDeletedListener = setupListener(
      'gameDeleted',
      handleGameDeleted
    );
    const removeAllGamesDeletedListener = setupListener(
      'allGamesDeleted',
      handleGameDeleted
    );

    // Cleanup listeners on unmount
    return () => {
      removeGameJoinedListener();
      removeGameLeftListener();
      removeGameUpdatedListener();
      removeGameDeletedListener();
      removeAllGamesDeletedListener();
    };
  }, [
    setupListener,
    handleRefresh,
    handleOpponentLeft,
    handleOpponentJoin,
    handleGameDeleted,
  ]);

  // On load, set display name and opponent id if it exists
  useEffect(() => {
    fetchOpponentOf(playerId).then(opponentGame => {
      if (opponentGame) {
        setOpponentDisplayName(opponentGame.displayName);
      }
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
          <p style={{ color: playerColor }}>{displayName}</p>
          {opponentDisplayName && (
            <p style={{ color: opponentOf(playerColor) }}>
              {opponentDisplayName}
            </p>
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
          <Button onClick={handleLeaveGame}>Leave Game</Button>
        </div>
      </div>
    </div>
  );
};

export default Game;
