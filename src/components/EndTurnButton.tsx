import { useGameState } from '../GameState';
import { useGlobalState } from '../GlobalState';
import { GameId } from '../types';
import Button from './Button';

type EndTurnButtonProps = {
  gameId: GameId;
};

const EndTurnButton: React.FC<EndTurnButtonProps> = ({ gameId }) => {
  const { gameState } = useGameState();
  const { updateGame } = useGlobalState();

  const handleEndTurn = async () => {
    try {
      await updateGame(gameId, gameState);
      console.log('Game state successfully updated!');
    } catch (error) {
      console.error('Error updating the game state:', error);
    }
  };

  return <Button onClick={handleEndTurn}>End Turn</Button>;
};

export default EndTurnButton;
