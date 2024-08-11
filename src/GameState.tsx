import { createContext, useContext, useState } from 'react';
import { Cell } from './components/Board';
import { initializeBoard } from './utils';

type GameState = {
  board: Cell[][];
  redCoins: number;
  blueCoins: number;
  turnNumber: number;
  phaseNumber: number;
  redInfluence: number[];
};

// Initial state
const initialGameState: GameState = {
  board: initializeBoard(5),
  redCoins: 10,
  blueCoins: 10,
  turnNumber: 1,
  phaseNumber: 1,
  redInfluence: [50],
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
