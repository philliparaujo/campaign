import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useGlobalState } from '../GlobalState';
import { GameId, PlayerId } from '../types';
import { newGameId, newPlayerId } from '../utils';

function HomeScreen() {
  const [playerId, setPlayerId] = useState<PlayerId>('');
  const [inputGameId, setInputGameId] = useState<GameId>('');
  const location = useLocation();
  const navigate = useNavigate();

  const {
    activeGames,
    playerGames,
    createGame,
    joinGame,
    deleteAllGames,
    gameExists,
  } = useGlobalState();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    let playerId = queryParams.get('playerId');

    if (!playerId) {
      playerId = newPlayerId();
      queryParams.set('playerId', playerId);
      navigate({ search: queryParams.toString() }, { replace: true });
    }

    setPlayerId(playerId);
  }, [location.search, navigate]);

  useEffect(() => {
    // Fetch the list of active games and players
    console.log('Active games:', activeGames);
    console.log('Player games:', playerGames);
  }, [activeGames, playerGames]);

  const handleCreateGame = async () => {
    if (!playerId) {
      console.error('No player ID found.');
      return;
    }
    const gameId = await newGameId(gameExists);

    createGame(gameId, playerId)
      .then(() => {
        navigate(`/game?gameId=${gameId}&playerId=${playerId}`);
      })
      .catch(error => {
        console.error('Error creating game:', error);
      });
  };

  const handleJoinGame = async (gameId: GameId) => {
    if (!playerId) {
      console.error('No player ID found.');
      return;
    }

    joinGame(gameId, playerId)
      .then(() => {
        navigate(`/game?gameId=${gameId}&playerId=${playerId}`);
      })
      .catch(error => {
        console.error('Error joining game:', error);
      });
  };

  const handleDeleteAllGames = async () => {
    deleteAllGames();
  };

  return (
    <div>
      <h1>CAMPAIGN</h1>
      <p>{`Player ID: ${playerId}`}</p>
      <Button onClick={handleCreateGame}>Create Game</Button>
      <div>
        <Button onClick={() => handleJoinGame(inputGameId)}>Join Game</Button>
        <input
          type="text"
          value={inputGameId}
          onChange={e => setInputGameId(e.target.value)}
        />
      </div>
      <Button onClick={handleDeleteAllGames}>Delete All Games</Button>
    </div>
  );
}

export default HomeScreen;
