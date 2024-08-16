import { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { GameStateProvider } from '../GameState';
import { useGlobalState } from '../GlobalState';
import Game from './Game';
import { GameId, PlayerId } from '../types';

function GameWrapper() {
  const [gameId, setGameId] = useState<GameId | null>(null);
  const [playerId, setPlayerId] = useState<PlayerId | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const location = useLocation();

  const { fetchGame } = useGlobalState();

  // Extract gameId and playerId from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    const playerIdFromUrl = queryParams.get('playerId') as PlayerId;
    const gameIdFromUrl = queryParams.get('gameId') as GameId;

    if (playerIdFromUrl && gameIdFromUrl) {
      setPlayerId(playerIdFromUrl);
      setGameId(gameIdFromUrl);
      fetchGame(gameIdFromUrl).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [location.search, fetchGame]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!gameId || !playerId) {
    console.log('Navigating back due to missing IDs');
    return <Navigate to="/" />;
  }

  return (
    <GameStateProvider gameId={gameId}>
      <Game playerId={playerId} gameId={gameId} />
    </GameStateProvider>
  );
}

export default GameWrapper;
