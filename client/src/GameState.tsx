import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { size, startingCoins } from 'shared/src/GameSettings';
import { useGlobalState } from './GlobalState';
import {
  Board,
  Cell,
  FactCheck,
  Floor,
  GameId,
  GameState,
  Influence,
  Opinion,
  PlayerAction,
  PlayerColor,
  PlayerId,
  PlayerInfo,
  Poll,
} from 'shared/src/types';
import {
  calculatePublicOpinion,
  createNewGameState,
  getRedSample,
  handleAccusePoll,
  handleDoubtPoll,
  initializeBoard,
} from 'shared/src/utils';

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
  setCoins: (color: PlayerColor, coins: number) => void;
  setTurnNumber: (turnNumber: number) => void;
  setPhaseNumber: (phaseNumber: number) => void;
  setPhaseAction: (color: PlayerColor, action: PlayerAction) => void;
  setFactCheck: (color: PlayerColor, factCheck: FactCheck) => void;
  regenerateBoard: () => void;
  setPublicOpinionHistory: (publicOpinionHistory: Opinion[]) => void;
  savePoll: (pollColor: PlayerColor, newPoll: Poll) => Poll[];
  incrementPhaseNumber: () => void;
  playerIdFromColor: (color: PlayerColor) => PlayerId;
};

const GameStateContext = createContext<GameStateContextType | undefined>(
  undefined
);

export const GameStateProvider = ({
  gameId,
  children,
}: {
  gameId: GameId;
  children: React.ReactNode;
}) => {
  const { activeGames, fetchGame } = useGlobalState();
  const initialGameState = activeGames[gameId] || createNewGameState();
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  // Once new gameId received, load in initial state if game already exists
  useEffect(() => {
    if (gameId) {
      fetchGame(gameId).then(gameState => {
        setGameState(gameState);
      });
    }
  }, [gameId, fetchGame]);

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

  const setCoins = (color: PlayerColor, coins: number) => {
    setGameState(prev => ({
      ...prev,
      players: {
        ...prev.players,
        [color]: {
          ...prev.players[color],
          coins: coins,
        },
      },
    }));
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
      players: {
        ...prev.players,
        [color]: {
          ...prev.players[color],
          phaseAction: action,
        },
      },
    }));
  };

  const setFactCheck = (color: PlayerColor, factCheck: FactCheck) => {
    setGameState(prev => ({
      ...prev,
      players: {
        ...prev.players,
        [color]: {
          ...prev.players[color],
          factCheck: factCheck,
        },
      },
    }));
  };

  const resetPhaseActions = () => {
    setGameState(prev => ({
      ...prev,
      players: {
        ...prev.players,
        red: {
          ...prev.players.red,
          phaseAction: '',
        },
        blue: {
          ...prev.players.blue,
          phaseAction: '',
        },
      },
    }));
  };

  const regenerateBoard = () => {
    setGameState(prev => ({ ...prev, board: initializeBoard(size) }));
    setCoins('red', startingCoins);
    setCoins('blue', startingCoins);
  };

  const setPublicOpinionHistory = (publicOpinionHistory: Opinion[]) => {
    setGameState(prev => ({ ...prev, publicOpinionHistory }));
  };

  const savePoll = (pollColor: PlayerColor, newPoll: Poll): Poll[] => {
    const polls = gameState.players[pollColor].pollHistory;
    const newPolls = [...polls, newPoll];

    setGameState(prev => ({
      ...prev,
      players: {
        ...prev.players,
        [pollColor]: {
          ...prev.players[pollColor],
          pollHistory: newPolls,
        },
      },
    }));
    return newPolls;
  };

  const incrementPhaseNumber = () => {
    // Define new variables
    let newRedCoins = gameState.players.red.coins;
    let newBlueCoins = gameState.players.blue.coins;
    let newPhaseNumber = gameState.phaseNumber + 1;
    let newTurnNumber = gameState.turnNumber;
    let newPublicOpinionHistory: Opinion[] = gameState.publicOpinionHistory.map(
      opinion => ({
        trueRedPercent: opinion.trueRedPercent,
        redPublicOpinion: [...opinion.redPublicOpinion],
      })
    );

    const lastOpinion =
      newPublicOpinionHistory[gameState.turnNumber]['redPublicOpinion'][
        gameState.phaseNumber - 1
      ];

    if (gameState.phaseNumber !== 2) {
      newPublicOpinionHistory[newTurnNumber]['redPublicOpinion'][
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

        let newRedPolls = gameState.players.red.pollHistory;
        let newBluePolls = gameState.players.blue.pollHistory;
        console.log(newRedPolls, newBluePolls);

        if (newRedPolls.length <= gameState.turnNumber) {
          newRedPolls = savePoll('red', dummyPoll);
        }

        if (newBluePolls.length <= gameState.turnNumber) {
          newBluePolls = savePoll('blue', dummyPoll);
        }

        // Calculate and store the average opinion
        const averageOpinion = calculatePublicOpinion(
          newRedPolls,
          newBluePolls,
          gameState.turnNumber
        );
        newPublicOpinionHistory[newTurnNumber]['redPublicOpinion'][
          newPhaseNumber - 1
        ] = averageOpinion;
        break;
      case 3:
        /* End phase 3: store true poll, update public opinion based on 
           fact-checking, reset coins/ads */
        const redPercent = getRedSample(gameState.board, undefined, true);
        newPublicOpinionHistory[gameState.turnNumber]['trueRedPercent'] =
          redPercent;

        let newOpinion =
          newPublicOpinionHistory[gameState.turnNumber]['redPublicOpinion'][
            gameState.phaseNumber - 1
          ];

        switch (gameState.players.red.factCheck) {
          case 'doubt':
            newOpinion += handleDoubtPoll('red', gameState);
            break;
          case 'accuse':
            newOpinion += handleAccusePoll('red', gameState);
            break;
          default:
        }

        switch (gameState.players.blue.factCheck) {
          case 'doubt':
            newOpinion += handleDoubtPoll('blue', gameState);
            break;
          case 'accuse':
            newOpinion += handleAccusePoll('blue', gameState);
            break;
          default:
        }

        removeAllFloorInfluence();
        newPublicOpinionHistory[gameState.turnNumber]['redPublicOpinion'][
          newPhaseNumber - 1
        ] = newOpinion;
        newRedCoins = 10 + Math.floor(newOpinion * 10);
        newBlueCoins = 10 + Math.floor((1 - newOpinion) * 10);
        break;
      case 4:
        /* End phase 4: update phases/turns, opinion storage for next turn */
        newPhaseNumber = 1;
        newTurnNumber++;

        setFactCheck('red', '');
        setFactCheck('blue', '');

        newPublicOpinionHistory.push({
          trueRedPercent: null,
          redPublicOpinion: [
            lastOpinion,
            lastOpinion,
            lastOpinion,
            lastOpinion,
          ],
        });
    }

    setCoins('red', newRedCoins);
    setCoins('blue', newBlueCoins);
    setTurnNumber(newTurnNumber);
    setPhaseNumber(newPhaseNumber);
    resetPhaseActions();
    setPublicOpinionHistory(newPublicOpinionHistory);
  };

  const playerIdFromColor = useCallback(
    (color: PlayerColor): PlayerId => {
      switch (color) {
        case 'red':
          return gameState.players.red.id;
        case 'blue':
          return gameState.players.blue.id;
        default:
          throw new Error('Invalid color');
      }
    },
    [gameState.players.blue.id, gameState.players.red.id]
  );

  return (
    <GameStateContext.Provider
      value={{
        gameState,
        setGameState,
        setFloorInfluence,
        removeAllFloorInfluence,
        setCoins,
        setTurnNumber,
        setPhaseNumber,
        setFactCheck,
        setPhaseAction,
        regenerateBoard,
        setPublicOpinionHistory,
        savePoll,
        incrementPhaseNumber,
        playerIdFromColor,
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
