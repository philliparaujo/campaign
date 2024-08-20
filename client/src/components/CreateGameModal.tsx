import Modal from './Modal';
import './CreateGameModal.css';

interface CreateGameModalProps {
  show: boolean;
  onClose: () => void;
  content: React.ReactNode;
}

const CreateGameModal: React.FC<CreateGameModalProps> = ({
  show,
  onClose,
  content,
}) => {
  return (
    <Modal show={show} onClose={onClose}>
      <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>Create Game</h1>
      <div className="modal-content">{content}</div>
    </Modal>
  );
};

export default CreateGameModal;
