import { createContext, useContext, useState } from 'react';
import {
  Board,
  Cell,
  Floor,
  GameState,
  Influence,
  Opinion,
  PlayerAction,
  PlayerColor,
  Poll,
} from './types';
import {
  calculatePublicOpinion,
  getRedSample,
  handleAccusePoll,
  handleDoubtPoll,
  initializeBoard,
} from './utils';

// Initial state
export const size = 5;
const debugMode = true;

const initialGameState: GameState = {
  board: initializeBoard(size),
  redCoins: 10,
  blueCoins: 10,
  turnNumber: 1,
  phaseNumber: 1,
  phaseActions: { red: '', blue: '' },
  redPublicOpinion: [
    { redPublicOpinion: [0.5, 0.5, 0.5, 0.5], trueRedPercent: 0.5 },
    { redPublicOpinion: [0.5, 0.5, 0.5, 0.5], trueRedPercent: null },
  ],
  redPolls: [
    { startRow: 0, endRow: 4, startCol: 0, endCol: 4, redPercent: 0.5 },
  ],
  bluePolls: [
    { startRow: 0, endRow: 4, startCol: 0, endCol: 4, redPercent: 0.5 },
  ],
  debugMode: debugMode,
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
  setPhaseAction: (color: PlayerColor, action: PlayerAction) => void;
  regenerateBoard: () => void;
  setRedPublicOpinion: (opinion: Opinion[]) => void;
  savePoll: (color: PlayerColor, newPoll: Poll) => Poll[];
  incrementPhaseNumber: () => void;
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

  const setPhaseAction = (color: PlayerColor, action: PlayerAction) => {
    setGameState(prev => ({
      ...prev,
      phaseActions: { ...prev.phaseActions, [color]: action },
    }));
  };

  const resetPhaseActions = () => {
    setGameState(prev => ({
      ...prev,
      phaseActions: { red: '', blue: '' },
    }));
  };

  const regenerateBoard = () => {
    setGameState(prev => ({ ...prev, board: initializeBoard(size) }));
  };

  const setRedPublicOpinion = (redPublicOpinion: Opinion[]) => {
    setGameState(prev => ({ ...prev, redPublicOpinion }));
  };

  const savePoll = (pollColor: PlayerColor, newPoll: Poll): Poll[] => {
    const polls =
      pollColor === 'red' ? gameState.redPolls : gameState.bluePolls;
    setGameState(prev => ({
      ...prev,
      [pollColor + 'Polls']: [...polls, newPoll],
    }));
    return [...polls, newPoll];
  };

  const incrementPhaseNumber = () => {
    // Define new variables
    let newRedCoins = gameState.redCoins;
    let newBlueCoins = gameState.blueCoins;
    let newPhaseNumber = gameState.phaseNumber + 1;
    let newTurnNumber = gameState.turnNumber;
    let newRedPublicOpinion: Opinion[] = gameState.redPublicOpinion.map(
      opinion => ({
        trueRedPercent: opinion.trueRedPercent,
        redPublicOpinion: [...opinion.redPublicOpinion],
      })
    );

    const lastOpinion =
      newRedPublicOpinion[gameState.turnNumber]['redPublicOpinion'][
        gameState.phaseNumber - 1
      ];

    if (gameState.phaseNumber !== 2) {
      newRedPublicOpinion[newTurnNumber]['redPublicOpinion'][
        newPhaseNumber - 1
      ] = lastOpinion;
    }

    switch (gameState.phaseNumber) {
      case 2:
        /* End phase 2: calculate new public opinion from published polls */
        const dummyPoll = {
          startRow: 0,
          endRow: size - 1,
          startCol: 0,
          endCol: size - 1,
          redPercent: 0.5,
        };

        console.log(gameState.redPolls, gameState.bluePolls);

        let newRedPolls = gameState.redPolls;
        let newBluePolls = gameState.bluePolls;

        if (gameState.redPolls.length <= gameState.turnNumber) {
          newRedPolls = savePoll('red', dummyPoll);
        }

        if (gameState.bluePolls.length <= gameState.turnNumber) {
          newBluePolls = savePoll('blue', dummyPoll);
        }

        // Calculate and store the average opinion
        const averageOpinion = calculatePublicOpinion(
          newRedPolls,
          newBluePolls,
          gameState.turnNumber
        );
        newRedPublicOpinion[newTurnNumber]['redPublicOpinion'][
          newPhaseNumber - 1
        ] = averageOpinion;
        break;
      case 3:
        /* End phase 3: store true poll, update public opinion based on 
           fact-checking, reset coins/ads */
        const redPercent = getRedSample(gameState.board, undefined, true);
        newRedPublicOpinion[gameState.turnNumber]['trueRedPercent'] =
          redPercent;

        let newOpinion =
          newRedPublicOpinion[gameState.turnNumber]['redPublicOpinion'][
            gameState.phaseNumber - 1
          ];

        switch (gameState.phaseActions['red']) {
          case 'doubt':
            newOpinion += handleDoubtPoll('red', gameState);
            break;
          case 'accuse':
            newOpinion += handleAccusePoll('red', gameState);
            break;
          default:
        }

        switch (gameState.phaseActions['blue']) {
          case 'doubt':
            newOpinion += handleDoubtPoll('blue', gameState);
            break;
          case 'accuse':
            newOpinion += handleAccusePoll('blue', gameState);
            break;
          default:
        }

        removeAllFloorInfluence();
        newRedPublicOpinion[gameState.turnNumber]['redPublicOpinion'][
          newPhaseNumber - 1
        ] = newOpinion;
        newRedCoins = 10 + Math.floor(newOpinion * 10);
        newBlueCoins = 10 + Math.floor((1 - newOpinion) * 10);
        break;
      case 4:
        /* End phase 4: update phases/turns, opinion storage for next turn */
        newPhaseNumber = 1;
        newTurnNumber++;

        newRedPublicOpinion.push({
          trueRedPercent: null,
          redPublicOpinion: [
            lastOpinion,
            lastOpinion,
            lastOpinion,
            lastOpinion,
          ],
        });
    }

    setRedCoins(newRedCoins);
    setBlueCoins(newBlueCoins);
    setTurnNumber(newTurnNumber);
    setPhaseNumber(newPhaseNumber);
    resetPhaseActions();
    setRedPublicOpinion(newRedPublicOpinion);
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
        setPhaseAction,
        regenerateBoard,
        setRedPublicOpinion,
        savePoll,
        incrementPhaseNumber,
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
