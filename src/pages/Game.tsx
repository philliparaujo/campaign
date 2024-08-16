import { useEffect, useState } from 'react';
import BoardUI from '../components/Board';
import Button from '../components/Button';
import HUD from '../components/HUD';
import PublicOpinion from '../components/PublicOpinion';
import Scoreboard from '../components/Scoreboard';
import { size, useGameState } from '../GameState';
import { useGlobalState } from '../GlobalState';
import { GameId, PlayerColor, PlayerId, PollRegion } from '../types';
import { useNavigate } from 'react-router-dom';
import { opponentOf } from '../utils';

type GameProps = {
  gameId: GameId;
  playerId: PlayerId;
  playerColor: PlayerColor;
  opponentId: PlayerId | null;
};

const Game: React.FC<GameProps> = ({
  gameId,
  playerId,
  playerColor,
  opponentId,
}) => {
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

  const { leaveGame, updateGame, fetchGame } = useGlobalState();
  const { gameState, setGameState } = useGameState();
  const navigate = useNavigate();

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

  const handleLeaveGame = async () => {
    try {
      await leaveGame(gameId, playerId);
      navigate('/');
    } catch (error) {
      console.error('Error leaving the game:', error);
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
          <Button onClick={handleRefresh}>Refresh</Button>
          <Button onClick={handleLeaveGame}>Leave Game</Button>
        </div>
      </div>
    </div>
  );
};

export default Game;
