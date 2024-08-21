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

function useScreen() {
  const [screen, setScreen] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    orientation:
      window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
  });

  useEffect(() => {
    const handleResize = () => {
      setScreen({
        width: window.innerWidth,
        height: window.innerHeight,
        orientation:
          window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screen;
}

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

  const rulesModal = (
    <RulesModal show={openModal === 'rules'} onClose={handleCloseModal} />
  );
  const settingsModal = (
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
            {showRoadInfluence ? 'Hide Road Influence' : 'Show Road Influence'}
          </Button>
        </>
      }
    />
  );
  const leaveGameButton = (
    <Button
      onClick={() => tryToLeaveGame(gameId, playerId, navigate, leaveGame)}
    >
      Leave Game
    </Button>
  );
  const settingsButton = (
    <Button onClick={() => setOpenModal('settings')}>Settings</Button>
  );

  const gameIdDisplay = <GameIdDisplay gameId={gameId} />;
  const nameDisplays = (
    <NameDisplays
      displayName={displayName}
      opponentDisplayName={opponentDisplayName}
      playerColor={playerColor}
    />
  );
  const turnIndicator = <TurnIndicator />;
  const phaseIndicator = <PhaseIndicator />;
  const hud = (
    <HUD
      playerColor={playerColor}
      gameId={gameId}
      pollInputs={pollInputs}
      setPollInputs={setPollInputs}
      settingPollRegion={settingPollRegion}
      setSettingPollRegion={setSettingPollRegion}
    />
  );
  const scoreboard = (
    <Scoreboard playerColor={playerColor} showTruePolling={showStats} />
  );
  const gameOverModal = (
    <GameOverModal
      show={gameOver(gameState)}
      finalRedPercent={
        publicOpinionHistory[turnNumber]?.redPublicOpinion[phaseNumber - 1]
      }
      gameId={gameId}
      playerId={playerId}
    />
  );
  const publicOpinion = <PublicOpinion />;
  const boardUI = (
    <BoardUI
      playerColor={playerColor}
      pollInputs={pollInputs}
      setPollInputs={setPollInputs}
      showRoadInfluence={showRoadInfluence}
      settingPollRegion={settingPollRegion}
      setSettingPollRegion={setSettingPollRegion}
    />
  );

  const { width, orientation } = useScreen();

  if (width >= 1024) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          boxSizing: 'border-box',
          maxWidth: '1600px', // Constrain the maximum width of the overall container
          margin: '0 auto', // Center the container on large screens
        }}
      >
        {rulesModal}
        {settingsModal}
        {gameOverModal}

        {/* Top Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: '1200px', // Constrain the width of the top bar
            marginBottom: '20px',
          }}
        >
          {/* Left Section: Leave Game, Settings, Game ID, and Name Displays */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '10px',
              flexGrow: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: '30px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  maxWidth: '150px', // Constrain the width of the buttons
                }}
              >
                {leaveGameButton}
                {settingsButton}
              </div>
              <div style={{ flexGrow: 1 }}>{nameDisplays}</div>
            </div>
            <div style={{ textAlign: 'left', marginLeft: '10px' }}>
              {gameIdDisplay}
            </div>
          </div>

          {/* Right Section: Turn and Phase Indicators */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              maxWidth: '200px', // Constrain the width of the indicators
              visibility: gameOver(gameState) ? 'hidden' : 'visible',
            }}
          >
            {turnIndicator}
            {phaseIndicator}
          </div>
        </div>

        <hr style={{ width: '100%' }} />

        {/* Content Section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            gap: '40px',
            maxWidth: '1200px', // Constrain the width of the content
          }}
        >
          <div style={{ flexGrow: 1 }}>
            <div>
              {hud}
              {scoreboard}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flexGrow: 1,
              maxWidth: '600px', // Constrain the width of the publicOpinion and boardUI
            }}
          >
            {publicOpinion}
            {boardUI}
          </div>
        </div>
      </div>
    );
  } else if (orientation === 'landscape') {
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
        {rulesModal}
        {settingsModal}
        {gameOverModal}

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '60px',
              flexDirection: 'row',
              marginBottom: '10px',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: '30px',
                flexGrow: 1, // Allows this section to take up as much space as possible
              }}
            >
              <div style={{ flexGrow: 1, maxWidth: '150px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                  }}
                >
                  {leaveGameButton}
                  {settingsButton}
                </div>
                {gameIdDisplay}
              </div>
              <div style={{ flexGrow: 1 }}>{nameDisplays}</div>
              <div
                style={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  visibility: gameOver(gameState) ? 'hidden' : 'initial',
                }}
              >
                {turnIndicator}
                {phaseIndicator}
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            gap: '40px',
          }}
        >
          <div style={{ flexGrow: 1 }}>
            <div>
              {hud}
              {scoreboard}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flexGrow: 1,
            }}
          >
            {publicOpinion}
            {boardUI}
          </div>
        </div>
      </div>
    );
  } else {
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
        {rulesModal}
        {settingsModal}
        {gameOverModal}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '60px',
              flexDirection: 'row',
              marginBottom: '10px',
              justifyContent: 'space-around',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                  }}
                >
                  {leaveGameButton}
                  {settingsButton}
                </div>
                {gameIdDisplay}
              </div>
              {nameDisplays}
            </div>
          </div>
          {turnIndicator}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ display: gameOver(gameState) ? 'none' : 'initial' }}>
              {phaseIndicator}
              {hud}
              {scoreboard}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {publicOpinion}
            {boardUI}
          </div>
        </div>
      </div>
    );
  }
};

export default Game;
