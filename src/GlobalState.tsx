import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ActiveGames, GameId, GameState, PlayerGames, PlayerId } from './types';

type GlobalStateContextType = {
  playerGames: PlayerGames;
  activeGames: ActiveGames;

  createGame: (gameId: GameId, playerId: PlayerId) => Promise<void>;
  joinGame: (gameId: GameId, playerId: PlayerId) => Promise<void>;
  deleteAllGames: () => Promise<void>;

  fetchGame: (gameId: GameId) => Promise<any>; // Returns GameState
  gameExists: (gameId: GameId) => Promise<boolean>;
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
      try {
        const response = await fetch('http://localhost:5000/games');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            'Failed to fetch initial state: ' + JSON.stringify(errorData)
          );
        }
        const gameData = await response.json();
        setActiveGames(gameData.activeGames);
        setPlayerGames(gameData.playerGames);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    };

    initializeGames();
  }, []);

  const createGame = useCallback(
    async (gameId: GameId, playerId: PlayerId): Promise<void> => {
      try {
        const response = await fetch('http://localhost:5000/game/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ gameId, playerId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to create the game: ${errorData.message}`);
        }

        const gameState = await response.json();
        setActiveGames(prevRecord => ({ ...prevRecord, [gameId]: gameState }));
        setPlayerGames(prevRecord => ({ ...prevRecord, [playerId]: gameId }));
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error('An unknown error occurred during game creation');
        }
        throw error;
      }
    },
    []
  );

  const joinGame = useCallback(
    async (gameId: GameId, playerId: PlayerId): Promise<void> => {
      try {
        const response = await fetch('http://localhost:5000/game/join', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ gameId, playerId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to join the game: ${errorData.message}`);
        }

        const gameState = await response.json();
        setActiveGames(prevRecord => ({ ...prevRecord, [gameId]: gameState }));
        setPlayerGames(prevRecord => ({ ...prevRecord, [playerId]: gameId }));
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error('An unknown error occurred during game joining');
        }
        throw error;
      }
    },
    []
  );

  const deleteAllGames = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:5000/games/deleteAll', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete all games: ${errorData.message}`);
      }

      const result = await response.json();
      setActiveGames({});
      setPlayerGames({});

      console.log(result.message);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('An unknown error occurred during games deletion');
      }
      throw error;
    }
  }, []);

  const fetchGame = useCallback(async (gameId: GameId): Promise<any> => {
    try {
      const response = await fetch(`http://localhost:5000/games/${gameId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch game: ${errorData.message}`);
      }

      return await response.json();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('An unknown error occurred during game fetching');
      }
    }
  }, []);

  const gameExists = useCallback(async (gameId: GameId): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:5000/games/${gameId}`);
      return response.ok;
    } catch (error: unknown) {
      console.error('An unknown error occurred during game existence check');
      return false;
    }
  }, []);

  const updateGame = useCallback(
    async (gameId: GameId, gameState: GameState): Promise<void> => {
      try {
        const response = await fetch('http://localhost:5000/game/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ gameId, gameState }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to update game: ${errorData.message}`);
        }

        setActiveGames(prevRecord => ({ ...prevRecord, [gameId]: gameState }));
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error('An unknown error occurred during game update');
        }
        throw error;
      }
    },
    []
  );

  return (
    <GlobalStateContext.Provider
      value={{
        playerGames,
        activeGames,
        createGame,
        joinGame,
        deleteAllGames,
        fetchGame,
        gameExists,
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
