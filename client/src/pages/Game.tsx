import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BoardUI from '../components/Board';
import Button from '../components/Button';
import GameIdDisplay from '../components/GameIdDisplay';
import GameOverModal from '../components/GameOverModal';
import HUD from '../components/HUD';
import NameDisplays from '../components/NameDisplays';
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
import { gameOver, saveGameInfo, tryToLeaveGame } from '../utils';
import './Game.css'; // Import the CSS file

const defaultPollRegion: PollRegion = {
  startRow: 0,
  endRow: size - 1,
  startCol: 0,
  endCol: size - 1,
};

type GameProps = {
  gameId: GameId;
  playerId: PlayerId;
  playerGame: PlayerGame;
};

const Game: React.FC<GameProps> = ({ gameId, playerId, playerGame }) => {
  const { leaveGame, updateGame, fetchGame, setupListener, fetchOpponentOf } =
    useGlobalState();
  const { gameState, setGameState, regenerateBoard } = useGameState();
  const { publicOpinionHistory, turnNumber, phaseNumber } = gameState;
  const { playerColor, displayName } = playerGame;

  const navigate = useNavigate();

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
      saveGameInfo(gameId, playerId, playerColor, displayName);
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
    <div className="game-container">
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

      <div className="game-top-bar">
        <div className="game-top-left-section">
          <div className="game-leftmost-section">
            <NameDisplays
              displayName={displayName}
              opponentDisplayName={opponentDisplayName}
              playerColor={playerColor}
            />
            <div>
              <div className="game-leftmost-buttons">
                <Button
                  onClick={() =>
                    tryToLeaveGame(gameId, playerId, navigate, leaveGame)
                  }
                >
                  Leave Game
                </Button>
                <Button onClick={() => setOpenModal('settings')}>
                  Settings
                </Button>
              </div>
              <GameIdDisplay gameId={gameId} />
            </div>
          </div>
        </div>
        <TurnIndicator />
      </div>

      <hr className="game-divider" />
      <div className="game-content">
        {/* Right Side */}
        <div className="game-right-side">
          <div
            className={gameOver(gameState) ? 'game-hidden' : 'game-visibility'}
          >
            <PhaseIndicator />
            <HUD
              playerColor={playerColor}
              gameId={gameId}
              pollInputs={pollInputs}
              setPollInputs={setPollInputs}
              settingPollRegion={settingPollRegion}
              setSettingPollRegion={setSettingPollRegion}
            />
            <Scoreboard playerColor={playerColor} showTruePolling={showStats} />
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

        {/* Left Side */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
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
      </div>
    </div>
  );
};

export default Game;
