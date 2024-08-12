import { createContext, useContext, useState } from 'react';
import {
  Board,
  Cell,
  Floor,
  GameState,
  Influence,
  Opinion,
  Poll,
} from './types';
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
  debugMode: true,
};

type GameStateContextType = {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;

  setFloorInfluence: (
    rowIndex: number,
    colIndex: number,
    floorIndex: number,
    newInfluence: Influence
  ) => void;
  removeAllFloorInfluence: () => void;
  setRedCoins: (redCoins: number) => void;
  setBlueCoins: (blueCoins: number) => void;
  setTurnNumber: (turnNumber: number) => void;
  setPhaseNumber: (phaseNumber: number) => void;
  regenerateBoard: () => void;
  setRedPublicOpinion: (opinion: Opinion[]) => void;
  savePoll: (color: 'red' | 'blue', newPoll: Poll) => void;
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

  const setFloorInfluence = (
    rowIndex: number,
    colIndex: number,
    floorIndex: number,
    newInfluence: Influence
  ) => {
    const cell = gameState.board[rowIndex][colIndex];
    if (cell.type !== 'building') return;

    const newCell: Cell = {
      ...cell,
      floors: cell.floors.map((floor: Floor, index: number) =>
        index === floorIndex ? { ...floor, influence: newInfluence } : floor
      ),
    };

    setGameState(prevState => ({
      ...prevState,
      board: prevState.board.map((row: Cell[], i) =>
        row.map((cell, j) =>
          i === rowIndex && j === colIndex ? newCell : cell
        )
      ),
    }));
  };

  const removeAllFloorInfluence = (): void => {
    const removeInfluence = (board: Board): Board => {
      for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
          const cell = board[row][col];

          if (cell.type === 'building') {
            cell.floors.forEach(floor => {
              floor.influence = '';
            });
          }
        }
      }
      return board;
    };

    setGameState(prevState => ({
      ...prevState,
      board: removeInfluence(prevState.board),
    }));
  };

  const setRedCoins = (redCoins: number) => {
    setGameState(prev => ({ ...prev, redCoins }));
  };

  const setBlueCoins = (blueCoins: number) => {
    setGameState(prev => ({ ...prev, blueCoins }));
  };

  const setTurnNumber = (turnNumber: number) => {
    setGameState(prev => ({
      ...prev,
      turnNumber: Math.max(0, turnNumber),
    }));
  };

  const setPhaseNumber = (phaseNumber: number) => {
    setGameState(prev => ({
      ...prev,
      phaseNumber: Math.min(Math.max(1, phaseNumber), 4),
    }));
  };

  const regenerateBoard = () => {
    setGameState(prev => ({ ...prev, board: initializeBoard(size) }));
  };

  const setRedPublicOpinion = (redPublicOpinion: Opinion[]) => {
    setGameState(prev => ({ ...prev, redPublicOpinion }));
  };

  const savePoll = (pollColor: 'red' | 'blue', newPoll: Poll) => {
    const polls =
      pollColor === 'red' ? gameState.redPolls : gameState.bluePolls;
    setGameState(prev => ({
      ...prev,
      [pollColor + 'Polls']: [...polls, newPoll],
    }));
  };

  return (
    <GameStateContext.Provider
      value={{
        gameState,
        setGameState,
        setFloorInfluence,
        removeAllFloorInfluence,
        setRedCoins,
        setBlueCoins,
        setTurnNumber,
        setPhaseNumber,
        regenerateBoard,
        setRedPublicOpinion,
        savePoll,
      }}
    >
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
