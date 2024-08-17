import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BoardUI from '../components/Board';
import Button from '../components/Button';
import HUD from '../components/HUD';
import PublicOpinion from '../components/PublicOpinion';
import Scoreboard from '../components/Scoreboard';
import { size, useGameState } from '../GameState';
import { socket, useGlobalState } from '../GlobalState';
import {
  GameId,
  GameState,
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
  const { leaveGame, updateGame, fetchGame, setupListener, fetchOpponentOf } =
    useGlobalState();
  const { gameState, setGameState } = useGameState();
  const navigate = useNavigate();

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
  const [settingPollRegion, setSettingPollRegion] =
    useState<PlayerColor | null>(null);
  const [showRoadInfluence, setShowRoadInfluence] = useState<boolean>(false);
  const [opponentDisplayName, setOpponentDisplayName] = useState<string | null>(
    null
  );

  /* Event handlers */
  const syncStateToGlobal = async () => {
    try {
      await updateGame(gameId, gameState);
    } catch (error) {
      console.error('Error updating the game state:', error);
    }
  };

  const tryToLeaveGame = async () => {
    try {
      await leaveGame(gameId, playerId);

      localStorage.removeItem('gameId');
      localStorage.removeItem('playerId');
      localStorage.removeItem('playerColor');
      localStorage.removeItem('displayName');

      navigate('/');
    } catch (error) {
      console.error('Error leaving the game:', error);
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
      fetchGame(gameId).then(gameState => {
        setGameState(gameState);
      });
      fetchOpponentOf(playerId).then(opponentGame => {
        if (opponentGame) {
          setOpponentDisplayName(opponentGame.displayName);
        }
      });
    } catch (error) {
      console.error('Error fetching opponent:', error);
    }
  }, [fetchOpponentOf, playerId, setOpponentDisplayName]);

  const handlePlayerLeft = useCallback(
    ({
      gameState,
      playerId: leftPlayerId,
    }: {
      gameState: GameState;
      playerId: PlayerId;
    }) => {
      console.log(leftPlayerId, playerId);
      if (leftPlayerId === playerId) {
        console.log('You have left the game');
        navigate('/');
      } else {
        console.log('Your opponent has left the game');
        setOpponentDisplayName(null);
      }
    },
    [playerId, navigate]
  );

  const handleGameDeleted = useCallback(async () => {
    navigate('/');
  }, [navigate]);

  // Listen and react to game events
  useEffect(() => {
    const removeGameJoinedListener = setupListener(
      'gameJoined',
      handleOpponentJoin
    );
    const removeGameLeftListener = setupListener('gameLeft', handlePlayerLeft);
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
    handlePlayerLeft,
    handleOpponentJoin,
    handleGameDeleted,
  ]);

  // On load, set display name and opponent id if it exists
  useEffect(() => {
    fetchGame(gameId).then(gameState => {
      setGameState(gameState);
    });
    fetchOpponentOf(playerId).then(opponentGame => {
      if (opponentGame) {
        setOpponentDisplayName(opponentGame.displayName);
      }
    });
  }, []);

  // Keep game/player information stored locally
  useEffect(() => {
    if (playerGame) {
      localStorage.setItem('gameId', gameId);
      localStorage.setItem('playerId', playerId);
      localStorage.setItem('playerColor', playerGame.playerColor);
      localStorage.setItem('displayName', playerGame.displayName);
    }
  }, [gameId, playerId, playerGame]);

  useEffect(() => {
    const savedGameId = localStorage.getItem('gameId');
    const savedPlayerId = localStorage.getItem('playerId');
    const savedPlayerColor = localStorage.getItem('playerColor');
    const savedDisplayName = localStorage.getItem('displayName');

    if (savedGameId && savedPlayerId && savedPlayerColor && savedDisplayName) {
      socket.emit('game/reconnect', {
        gameId: savedGameId,
        playerId: savedPlayerId,
        playerColor: savedPlayerColor,
        displayName: savedDisplayName,
      });
    }
  }, []);

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
          <Button onClick={syncStateToGlobal}>End Turn</Button>
          <Button onClick={tryToLeaveGame}>Leave Game</Button>
        </div>
      </div>
    </div>
  );
};

export default Game;
