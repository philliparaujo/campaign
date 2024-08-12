import { createContext, useContext, useState } from 'react';
import { GameState } from './types';
import { initializeBoard } from './utils';

// Initial state
export const size = 5;
const initialGameState: GameState = {
  board: initializeBoard(size),
  redCoins: 10,
  blueCoins: 10,
  turnNumber: 1,
  phaseNumber: 1,
  redPublicOpinion: [
    { redPublicOpinion: [50, 50, 50, 50], trueRedPercent: 50 },
    { redPublicOpinion: [50, 50, 50, 50], trueRedPercent: null },
  ],
  redPolls: [
    { startRow: 0, endRow: 4, startCol: 0, endCol: 4, redPercent: 50 },
  ],
  bluePolls: [
    { startRow: 0, endRow: 4, startCol: 0, endCol: 4, redPercent: 50 },
  ],
  debugMode: false,
};

type GameStateContextType = {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
};

const GameStateContext = createContext<GameStateContextType | undefined>(
  undefined
);

export const GameStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  return (
    <GameStateContext.Provider value={{ gameState, setGameState }}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};
