import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  ActiveGames,
  GameId,
  GameState,
  PlayerColor,
  PlayerGames,
  PlayerId,
} from './types';
import { io } from 'socket.io-client';

type GlobalStateContextType = {
  playerGames: PlayerGames;
  activeGames: ActiveGames;

  createGame: (
    gameId: GameId,
    playerId: PlayerId,
    playerColor: PlayerColor,
    displayName: string
  ) => Promise<void>;
  joinGame: (
    gameId: GameId,
    playerId: PlayerId,
    playerColor: PlayerColor,
    displayName: string
  ) => Promise<void>;
  leaveGame: (gameId: GameId, playerId: PlayerId) => Promise<void>;
  deleteAllGames: () => Promise<void>;

  fetchGame: (gameId: GameId) => Promise<any>; // Returns GameState

  // Returns id, color, gameId, displayName
  fetchPlayer: (playerId: PlayerId) => Promise<any>;
  fetchOpponentOf: (playerId: PlayerId) => Promise<any>;

  gameExists: (gameId: GameId) => Promise<boolean>;
  playerInGame: (playerId: PlayerId) => Promise<boolean>;

  updateGame: (gameId: GameId, gameState: GameState) => Promise<void>;
  setupListener: (event: string, callback: (data: any) => void) => () => void;
};

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(
  undefined
);

const socket = io('http://localhost:5000');

export const GlobalStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [playerGames, setPlayerGames] = useState<PlayerGames>({});
  const [activeGames, setActiveGames] = useState<ActiveGames>({});

  // Load games from database
  useEffect(() => {
    const initializeGames = (): void => {
      socket.emit('games/fetchAll');

      socket.on('allGamesFetched', gameData => {
        setActiveGames(gameData.activeGames);
        setPlayerGames(gameData.playerGames);
      });

      socket.on('error', errorData => {
        console.error('Failed to fetch initial state:', errorData.message);
      });
    };

    initializeGames();

    // Cleanup the socket listeners when the component unmounts
    return () => {
      socket.off('allGamesFetched');
      socket.off('error');
    };
  }, []);

  const createGame = useCallback(
    async (
      gameId: GameId,
      playerId: PlayerId,
      playerColor: PlayerColor,
      displayName: string
    ): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        socket.emit('game/create', {
          gameId,
          playerId,
          playerColor,
          displayName,
        });

        socket.on(
          'gameCreated',
          ({ gameState, gameId, playerColor, displayName }) => {
            setActiveGames(prevRecord => ({
              ...prevRecord,
              [gameId]: gameState,
            }));
            setPlayerGames(prevRecord => ({
              ...prevRecord,
              [playerId]: { gameId, playerColor, displayName },
            }));
            resolve();
          }
        );

        socket.on('error', errorData => {
          console.error('Error during game creation:', errorData.message);
          reject(new Error(errorData.message));
        });
      });
    },
    []
  );

  const joinGame = useCallback(
    async (
      gameId: GameId,
      playerId: PlayerId,
      playerColor: PlayerColor,
      displayName: string
    ): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        socket.emit('game/join', {
          gameId,
          playerId,
          playerColor,
          displayName,
        });

        socket.on(
          'gameJoined',
          ({ gameState, gameId, playerColor, displayName }) => {
            setActiveGames(prevRecord => ({
              ...prevRecord,
              [gameId]: gameState,
            }));
            setPlayerGames(prevRecord => ({
              ...prevRecord,
              [playerId]: { gameId, playerColor, displayName },
            }));
            resolve();
          }
        );

        socket.on('error', errorData => {
          console.error('Error during game joining:', errorData.message);
          reject(new Error(errorData.message));
        });
      });
    },
    []
  );

  const leaveGame = useCallback(
    async (gameId: GameId, playerId: PlayerId): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        socket.emit('game/leave', { gameId, playerId });

        socket.on('gameLeft', gameState => {
          if (!gameState.players.red.id && !gameState.players.blue.id) {
            socket.emit('game/delete', { gameId });

            setActiveGames(prevRecord => {
              const updatedRecord = { ...prevRecord };
              delete updatedRecord[gameId];
              return updatedRecord;
            });
          } else {
            setActiveGames(prevRecord => ({
              ...prevRecord,
              [gameId]: gameState,
            }));
          }

          setPlayerGames(prevRecord => {
            const updatedRecord = { ...prevRecord };
            delete updatedRecord[playerId];
            return updatedRecord;
          });

          resolve();
        });

        socket.on('error', errorData => {
          console.error('Error during game leaving:', errorData.message);
          reject(new Error(errorData.message));
        });
      });
    },
    []
  );

  const deleteAllGames = useCallback(async (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      socket.emit('games/deleteAll');

      socket.on('allGamesDeleted', result => {
        setActiveGames({});
        setPlayerGames({});
        console.log(result.message);
        resolve();
      });

      socket.on('error', errorData => {
        console.error('Error during games deletion:', errorData.message);
        reject(new Error(errorData.message));
      });
    });
  }, []);

  const fetchGame = useCallback(async (gameId: GameId): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      socket.emit('games/fetch', { gameId });

      socket.on('gameFetched', gameState => {
        resolve(gameState);
      });

      socket.on('error', errorData => {
        console.error('Error during game fetching:', errorData.message);
        reject(new Error(errorData.message));
      });
    });
  }, []);

  const fetchPlayer = useCallback(async (playerId: PlayerId): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      socket.emit('players/fetch', { playerId });

      socket.on('playerFetched', playerGame => {
        resolve(playerGame);
      });

      socket.on('error', errorData => {
        console.error('Error during player fetching:', errorData.message);
        reject(new Error(errorData.message));
      });
    });
  }, []);

  const fetchOpponentOf = useCallback(
    async (playerId: PlayerId): Promise<any> => {
      return new Promise<any>((resolve, reject) => {
        socket.emit('players/fetchOpponent', { playerId });

        socket.on('opponentFetched', opponentGame => {
          resolve(opponentGame);
        });

        socket.on('opponentNotFound', () => {
          resolve(null); // No opponent found
        });

        socket.on('error', errorData => {
          console.error('Error during opponent fetching:', errorData.message);
          reject(new Error(errorData.message));
        });
      });
    },
    []
  );

  const gameExists = useCallback(async (gameId: GameId): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
      socket.emit('games/exists', { gameId });

      socket.on('gameExists', ({ exists }) => {
        resolve(exists);
      });

      socket.on('error', errorData => {
        console.error('Error during game existence check:', errorData.message);
        reject(new Error(errorData.message));
      });
    });
  }, []);

  const playerInGame = useCallback(
    async (playerId: PlayerId): Promise<boolean> => {
      return new Promise<boolean>((resolve, reject) => {
        socket.emit('players/inGame', { playerId });

        socket.on('playerInGame', ({ inGame }) => {
          resolve(inGame);
        });

        socket.on('error', errorData => {
          console.error(
            'Error during player in game check:',
            errorData.message
          );
          reject(new Error(errorData.message));
        });
      });
    },
    []
  );

  const updateGame = useCallback(
    async (gameId: GameId, gameState: GameState): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        socket.emit('game/update', { gameId, gameState });

        socket.on('gameUpdated', () => {
          resolve();
        });

        socket.on('error', errorData => {
          console.error('Error during game update:', errorData.message);
          reject(new Error(errorData.message));
        });
      });
    },
    []
  );

  const setupListener = useCallback(
    (event: string, callback: (data: any) => void): (() => void) => {
      socket.on(event, callback);

      return () => {
        socket.off(event, callback);
      };
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
        leaveGame,
        deleteAllGames,
        fetchGame,
        fetchPlayer,
        fetchOpponentOf,
        gameExists,
        playerInGame,
        updateGame,
        setupListener,
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
