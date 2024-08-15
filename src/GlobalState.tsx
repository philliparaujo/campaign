import { createContext, useContext, useState } from 'react';
import {
  ActiveGames,
  GameId,
  GameState,
  PlayerColor,
  PlayerGames,
  PlayerId,
} from './types';

type GlobalStateContextType = {
  playerGames: PlayerGames;
  activeGames: ActiveGames;

  addPlayerToGame: (
    playerId: PlayerId,
    color: PlayerColor,
    gameId: GameId
  ) => void;
  removePlayerFromGame: (playerId: PlayerId) => void;
  createGame: (gameId: GameId, gameState: GameState) => void;
  removeGame: (gameId: GameId) => void;
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

  const addPlayerToGame = (
    playerId: PlayerId,
    color: PlayerColor,
    gameId: GameId
  ) => {
    setPlayerGames(prevRecord => ({ ...prevRecord, [playerId]: gameId }));
    setActiveGames(prevRecord => {
      const newRecord = { ...prevRecord };
      newRecord[gameId].players[color].id = playerId;
      return newRecord;
    });
  };

  const removePlayerFromGame = (playerId: PlayerId) => {
    setPlayerGames(prevRecord => {
      const newRecord = { ...prevRecord };
      delete newRecord[playerId];
      return newRecord;
    });
  };

  const createGame = (gameId: GameId, gameState: GameState) => {
    setActiveGames(prevRecord => ({ ...prevRecord, [gameId]: gameState }));
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
        addPlayerToGame,
        removePlayerFromGame,
        createGame,
        removeGame,
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
