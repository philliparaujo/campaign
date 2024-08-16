import { useGameState } from '../GameState';
import { useGlobalState } from '../GlobalState';
import { GameId } from '../types';
import Button from './Button';

type RefreshButtonProps = {
  gameId: GameId;
};

const RefreshButton: React.FC<RefreshButtonProps> = ({ gameId }) => {
  const { setGameState } = useGameState();
  const { fetchGame } = useGlobalState();

  const handleRefresh = async () => {
    try {
      const game = await fetchGame(gameId);
      setGameState(game.gameState);
      console.log('Game state successfully updated!');
    } catch (error) {
      console.error('Error updating the game state:', error);
    }
  };

  return <Button onClick={handleRefresh}>Refresh</Button>;
};

export default RefreshButton;
