import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BoardUI from '../components/Board';
import Button from '../components/Button';
import HUD from '../components/HUD';
import PhaseIndicator from '../components/PhaseIndicator';
import PublicOpinion from '../components/PublicOpinion';
import RulesModal from '../components/RulesModal';
import Scoreboard from '../components/Scoreboard';
import SettingsModal from '../components/SettingsModal';
import TurnIndicator from '../components/TurnIndicator';
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
import { gameOver, opponentOf } from '../utils';
import GameOverModal from '../components/GameOverModal';
import NameDisplays from '../components/NameDisplays';
import GameIdDisplay from '../components/GameIdDisplay';

type GameProps = {
  gameId: GameId;
  playerId: PlayerId;
  playerGame: PlayerGame;
};

const Game: React.FC<GameProps> = ({ gameId, playerId, playerGame }) => {
  const { leaveGame, updateGame, fetchGame, setupListener, fetchOpponentOf } =
    useGlobalState();
  const { gameState, setGameState, regenerateBoard } = useGameState();
  const navigate = useNavigate();

  const { publicOpinionHistory, turnNumber, phaseNumber } = gameState;
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
  const [openModal, setOpenModal] = useState<'rules' | 'settings' | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [showStats, setShowStats] = useState<boolean>(false);

  /* Event handlers */
  const syncStateToGlobal = useCallback(async () => {
    try {
      await updateGame(gameId, gameState);
    } catch (error) {
      console.error('Error updating the game state:', error);
    }
  }, [gameId, gameState, updateGame]);

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
  }, [fetchGame, fetchOpponentOf, gameId, playerId, setGameState]);

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

  const handleCloseModal = () => {
    setOpenModal(null);
  };

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
  }, [fetchGame, fetchOpponentOf, gameId, playerId, setGameState]);

  // Keep game/player information stored locally
  useEffect(() => {
    if (playerGame) {
      localStorage.setItem('gameId', gameId);
      localStorage.setItem('playerId', playerId);
      localStorage.setItem('playerColor', playerGame.playerColor);
      localStorage.setItem('displayName', playerGame.displayName);
    }
  }, [gameId, playerId, playerGame]);

  // Rejoin game if reconnected and player information stored locally
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

  useEffect(() => {
    if (pendingUpdate && gameId) {
      updateGame(gameId, { ...gameState })
        .then(() => {
          console.log('Game state updated successfully');
        })
        .catch(error => {
          console.error('Error updating the game state:', error);
        })
        .finally(() => {
          setPendingUpdate(false);
        });
    }
  }, [pendingUpdate, gameId, gameState, updateGame]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        boxSizing: 'border-box',
      }}
    >
      {/* Modal will be shown when isModalOpen is true */}
      <RulesModal show={openModal === 'rules'} onClose={handleCloseModal} />
      <SettingsModal
        show={openModal === 'settings'}
        onClose={handleCloseModal}
        buttons={
          <>
            <Button
              onClick={() => {
                regenerateBoard();
                setPendingUpdate(true);
              }}
            >
              Regenerate board
            </Button>
            <Button onClick={() => setShowStats(!showStats)}>
              {showStats ? 'Hide True Polling' : 'Show True Polling'}
            </Button>
            <Button onClick={() => setShowRoadInfluence(!showRoadInfluence)}>
              {showRoadInfluence
                ? 'Hide Road Influence'
                : 'Show Road Influence'}
            </Button>
          </>
        }
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Button onClick={tryToLeaveGame}>Leave Game</Button>
        </div>
        <NameDisplays
          displayName={displayName}
          opponentDisplayName={opponentDisplayName}
          playerColor={playerColor}
        />
        <GameIdDisplay gameId={gameId} />
        <TurnIndicator />
        <div>
          <Button onClick={() => setOpenModal('settings')}>Settings</Button>
        </div>
      </div>

      <hr style={{ width: '100%', marginBottom: '20px' }} />
      <div
        style={{
          display: 'flex',
          width: '100%',
          gap: '80px',
        }}
      >
        {/* Left Side */}
        <div>
          <PublicOpinion />
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
        {
          <div
            style={{
              width: '650px',
            }}
          >
            <div
              style={{
                visibility: gameOver(gameState) ? 'hidden' : 'visible',
              }}
            >
              <PhaseIndicator />
              <HUD
                playerColor={playerColor}
                pollInputs={pollInputs}
                setPollInputs={setPollInputs}
                settingPollRegion={settingPollRegion}
                setSettingPollRegion={setSettingPollRegion}
                syncStateToGlobal={syncStateToGlobal}
              />
              <Scoreboard
                playerColor={playerColor}
                showTruePolling={showStats}
                showRoadInfluence={showRoadInfluence}
                setShowRoadInfluence={setShowRoadInfluence}
              />
            </div>

            <GameOverModal
              show={gameOver(gameState)}
              finalRedPercent={
                publicOpinionHistory[turnNumber]?.redPublicOpinion[
                  phaseNumber - 1
                ]
              }
              gameId={gameId}
              playerId={playerId}
            />
          </div>
        }
      </div>
    </div>
  );
};

export default Game;
