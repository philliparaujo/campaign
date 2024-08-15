import { createContext, useContext, useEffect, useState } from 'react';
import { ActiveGames, GameId, PlayerGames, PlayerId } from './types';

type GlobalStateContextType = {
  playerGames: PlayerGames;
  activeGames: ActiveGames;

  createGame: (gameId: GameId, playerId: PlayerId) => Promise<void>;
  joinGame: (gameId: GameId, playerId: PlayerId) => Promise<void>;
  deleteAllGames: () => Promise<void>;

  fetchGame: (gameId: GameId) => Promise<void>;
};

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(
  undefined
);

export const GlobalStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [playerGames, setPlayerGames] = useState<PlayerGames>({});
  const [activeGames, setActiveGames] = useState<ActiveGames>({});

  // Load games from database
  useEffect(() => {
    const initializeGames = async (): Promise<void> => {
      fetch('http://localhost:5000/games')
        .then(response => {
          if (!response.ok) {
            return response.json().then(errorData => {
              throw new Error(
                'Failed to fetch initial state: ' + JSON.stringify(errorData)
              );
            });
          }
          return response.json();
        })
        .then(gameData => {
          setActiveGames(gameData.activeGames);
          setPlayerGames(gameData.playerGames);
        })
        .catch(error => {
          console.error(error.message);
        });
    };

    initializeGames();
  }, []);

  const createGame = (gameId: GameId, playerId: PlayerId): Promise<void> => {
    return fetch('http://localhost:5000/game/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId, playerId }),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error('Failed to create the game: ' + errorData.message);
          });
        }
        return response.json();
      })
      .then(gameState => {
        setActiveGames(prevRecord => ({ ...prevRecord, [gameId]: gameState }));
        setPlayerGames(prevRecord => ({ ...prevRecord, [playerId]: gameId }));
      })
      .catch(error => {
        console.error(error.message);
      });
  };

  const joinGame = (gameId: GameId, playerId: PlayerId): Promise<void> => {
    return fetch('http://localhost:5000/game/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId, playerId }),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error('Failed to join the game: ' + errorData.message);
          });
        }
        return response.json();
      })
      .then(gameState => {
        setActiveGames(prevRecord => ({ ...prevRecord, [gameId]: gameState }));
        setPlayerGames(prevRecord => ({ ...prevRecord, [playerId]: gameId }));
      })
      .catch(error => {
        console.error(error.message);
      });
  };

  const deleteAllGames = (): Promise<void> => {
    return fetch('http://localhost:5000/games/deleteAll', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error('Failed to delete all games: ' + errorData.message);
          });
        }
        setActiveGames({});
        setPlayerGames({});
        console.log('All games deleted successfully');
      })
      .catch(error => {
        console.error(error.message);
      });
  };

  const fetchGame = (gameId: GameId): Promise<void> => {
    return fetch(`http://localhost:5000/games/${gameId}`)
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error('Failed to fetch game: ' + errorData.message);
          });
        }
        return response.json();
      })
      .then(gameState => {
        console.log('Fetched game:', gameState);
      })
      .catch(error => {
        console.error(error.message);
      });
  };

  const removePlayerFromGame = (playerId: PlayerId) => {
    setPlayerGames(prevRecord => {
      const newRecord = { ...prevRecord };
      delete newRecord[playerId];
      return newRecord;
    });
  };

  const removeGame = (gameId: GameId) => {
    setActiveGames(prevRecord => {
      const newRecord = { ...prevRecord };
      delete newRecord[gameId];
      return newRecord;
    });
  };

  return (
    <GlobalStateContext.Provider
      value={{
        playerGames,
        activeGames,
        createGame,
        joinGame,
        deleteAllGames,
        fetchGame,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
