import { createContext, useContext, useEffect, useState } from 'react';
import { ActiveGames, GameId, GameState, PlayerGames, PlayerId } from './types';

type GlobalStateContextType = {
  playerGames: PlayerGames;
  activeGames: ActiveGames;

  createGame: (gameId: GameId, playerId: PlayerId) => Promise<void>;
  joinGame: (gameId: GameId, playerId: PlayerId) => Promise<void>;
  deleteAllGames: () => Promise<void>;

  fetchGame: (gameId: GameId) => Promise<any>;
  updateGame: (gameId: GameId, gameState: GameState) => Promise<void>;
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
        throw error;
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
        throw error;
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
        throw error;
      });
  };

  const fetchGame = (gameId: GameId): Promise<any> => {
    return fetch(`http://localhost:5000/games/${gameId}`)
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error('Failed to fetch game: ' + errorData.message);
          });
        }
        return response.json();
      })
      .catch(error => {
        console.error(error.message);
        throw error;
      });
  };

  const updateGame = (gameId: GameId, gameState: GameState): Promise<void> => {
    return fetch('http://localhost:5000/game/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId, gameState }),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error('Failed to update game: ' + errorData.message);
          });
        }
        setActiveGames(prevRecord => ({ ...prevRecord, [gameId]: gameState }));
      })
      .catch(error => {
        console.error(error.message);
        throw error;
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
        updateGame,
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
