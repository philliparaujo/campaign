import { useLocation, useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Button from '../components/Button';
import { GameId, PlayerId } from '../types';

function HomeScreen() {
  const [playerId, setPlayerId] = useState<PlayerId>('');
  const [inputGameId, setInputGameId] = useState<GameId>('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    let idFromUrl = queryParams.get('playerId');

    if (!idFromUrl) {
      idFromUrl = uuidv4();
      queryParams.set('playerId', idFromUrl);
      navigate({ search: queryParams.toString() }, { replace: true });
    }

    setPlayerId(idFromUrl);
  }, [location.search, navigate]);

  const handleCreateGame = async () => {
    if (!playerId) {
      console.error('No player ID found.');
      return;
    }

    const newGameId = uuidv4();
    try {
      const response = await fetch('http://localhost:5000/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: newGameId,
          playerId: playerId,
        }),
      });

      if (response.ok) {
        // Game created successfully on the server
        navigate(`/game?gameId=${newGameId}&playerId=${playerId}`);
      } else {
        const errorData = await response.json();
        console.error('Failed to create the game:', errorData.message);
      }
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const handleJoinGame = async (gameId: GameId) => {
    if (!playerId) {
      console.error('No player ID found.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/rooms/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: gameId,
          playerId: playerId,
        }),
      });

      if (response.ok) {
        // Successfully joined the game
        navigate(`/game?gameId=${gameId}&playerId=${playerId}`);
      } else {
        const errorData = await response.json();
        console.error('Failed to join the game:', errorData.message);
      }
    } catch (error) {
      console.error('Error joining game:', error);
    }
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
    </div>
  );
}

export default HomeScreen;
