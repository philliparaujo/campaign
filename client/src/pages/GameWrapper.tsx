import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { GameStateProvider } from '../GameState';
import { useGlobalState } from '../GlobalState';
import { GameId, PlayerGame, PlayerId } from 'shared//types';
import Game from './Game';

function GameWrapper() {
  const [gameId, setGameId] = useState<GameId | null>(null);
  const [playerId, setPlayerId] = useState<PlayerId | null>(null);
  const [playerGame, setPlayerGame] = useState<PlayerGame | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const location = useLocation();

  const { fetchPlayer } = useGlobalState();

  // Extract gameId, playerId, playerColor from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    const gameIdFromUrl = queryParams.get('gameId') as GameId;
    const playerIdFromUrl = queryParams.get('playerId') as PlayerId;

    if (playerIdFromUrl && gameIdFromUrl) {
      setGameId(gameIdFromUrl);
      setPlayerId(playerIdFromUrl);
      fetchPlayer(playerIdFromUrl)
        .then(playerGame => {
          setPlayerGame(playerGame);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [location.search, fetchPlayer]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!gameId || !playerId || !playerGame) {
    console.log('Navigating back due to missing IDs');
    return <Navigate to="/" />;
  }

  return (
    <GameStateProvider gameId={gameId}>
      <Game gameId={gameId} playerId={playerId} playerGame={playerGame} />
    </GameStateProvider>
  );
}

export default GameWrapper;
