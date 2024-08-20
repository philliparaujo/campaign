import Modal from './Modal';
import './JoinGameModal.css';

interface JoinGameModalProps {
  show: boolean;
  onClose: () => void;
  content: React.ReactNode;
}

const JoinGameModal: React.FC<JoinGameModalProps> = ({
  show,
  onClose,
  content,
}) => {
  return (
    <Modal show={show} onClose={onClose}>
      <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>Join Game</h1>
      <div className="modal-content">{content}</div>
    </Modal>
  );
};

export default JoinGameModal;
