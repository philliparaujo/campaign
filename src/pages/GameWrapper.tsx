import { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { GameStateProvider } from '../GameState';
import { useGlobalState } from '../GlobalState';
import Game from './Game';
import { GameId, PlayerColor, PlayerId } from '../types';

function GameWrapper() {
  const [gameId, setGameId] = useState<GameId | null>(null);
  const [playerId, setPlayerId] = useState<PlayerId | null>(null);
  const [playerColor, setPlayerColor] = useState<PlayerColor | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const location = useLocation();

  const { fetchGame } = useGlobalState();

  // Extract gameId, playerId, playerColor from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    const gameIdFromUrl = queryParams.get('gameId') as GameId;
    const playerIdFromUrl = queryParams.get('playerId') as PlayerId;

    if (playerIdFromUrl && gameIdFromUrl) {
      setGameId(gameIdFromUrl);
      setPlayerId(playerIdFromUrl);
      fetchGame(gameIdFromUrl)
        .then(gameState => {
          setPlayerColor(
            gameState.players.red.id === playerIdFromUrl ? 'red' : 'blue'
          );
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [location.search, fetchGame]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!gameId || !playerId || !playerColor) {
    console.log('Navigating back due to missing IDs');
    return <Navigate to="/" />;
  }

  return (
    <GameStateProvider gameId={gameId}>
      <Game gameId={gameId} playerId={playerId} playerColor={playerColor} />
    </GameStateProvider>
  );
}

export default GameWrapper;
