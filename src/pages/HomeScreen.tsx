import { useLocation, useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Button from '../components/Button';
import { useGlobalState } from '../GlobalState';
import { PlayerId } from '../types';

function HomeScreen() {
  const [playerId, setPlayerId] = useState<PlayerId>('');
  const location = useLocation();
  const navigate = useNavigate();

  const { createGame, addPlayerToGame } = useGlobalState();

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
        console.error('Failed to create the game:', response.json());
      }
    } catch (error) {
      console.error('Error creating game:', error);
    }

    // createGame(newGameId, createNewGameState());
    // addPlayerToGame(playerId, 'red', newGameId);
  };

  return (
    <div>
      <h1>CAMPAIGN</h1>
      <p>{`Player ID: ${playerId}`}</p>
      <Button onClick={handleCreateGame}>Create Game</Button>
    </div>
  );
}

export default HomeScreen;
