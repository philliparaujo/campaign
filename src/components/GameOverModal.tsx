import { useNavigate } from 'react-router-dom';
import { useGameState } from '../GameState';
import { useGlobalState } from '../GlobalState';
import { GameId, PlayerId } from '../types';
import { calculatePollResult } from '../utils';
import Button from './Button';
import Modal from './Modal';

interface GameOverModalProps {
  show: boolean;
  finalRedPercent: number;
  gameId: GameId;
  playerId: PlayerId;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  show,
  finalRedPercent,
  gameId,
  playerId,
}) => {
  const winningColor = finalRedPercent > 0.5 ? 'red' : 'blue';
  const winMessage = finalRedPercent > 0.5 ? 'Red wins!' : 'Blue wins!';

  const { leaveGame } = useGlobalState();
  const navigate = useNavigate();

  const tryToLeaveGame = async () => {
    try {
      await leaveGame(gameId, playerId);

      localStorage.removeItem('gameId');
      localStorage.removeItem('playerId');
      localStorage.removeItem('playerColor');
      localStorage.removeItem('displayName');

      navigate('/');
    } catch (error) {
      console.error('Error leaving the game:', error);
    }
  };

  return (
    <Modal show={show}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>GAME OVER</h1>
        <h2 style={{ color: winningColor }}>{winMessage}</h2>
        <h4>{`Public opinion: ${calculatePollResult(finalRedPercent)}`}</h4>

        <Button onClick={tryToLeaveGame}>Leave Game</Button>
      </div>
    </Modal>
  );
};

export default GameOverModal;
