import { useNavigate } from 'react-router-dom';
import { GameId, PlayerId } from 'shared/src/types';
import { calculatePollResult, tryToLeaveGame } from 'shared/src/utils';
import { useGlobalState } from '../GlobalState';
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
  const { leaveGame } = useGlobalState();
  const navigate = useNavigate();

  let winningColor, winMessage;
  if (finalRedPercent === 0.5) {
    winningColor = 'gray';
    winMessage = "It's a draw!";
  } else if (finalRedPercent > 0.5) {
    winningColor = 'red';
    winMessage = 'Red wins!';
  } else {
    winningColor = 'blue';
    winMessage = 'Blue wins!';
  }

  return (
    <Modal show={show}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>GAME OVER</h1>
        <h2 style={{ color: winningColor }}>{winMessage}</h2>
        <h4>{`Public opinion: ${calculatePollResult(finalRedPercent)}`}</h4>

        <Button
          onClick={() => tryToLeaveGame(gameId, playerId, navigate, leaveGame)}
        >
          Leave Game
        </Button>
      </div>
    </Modal>
  );
};

export default GameOverModal;
