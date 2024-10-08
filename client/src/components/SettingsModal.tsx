import Modal from './Modal';

interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
  buttons: React.ReactNode;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  show,
  onClose,
  buttons,
}) => {
  return (
    <Modal show={show} onClose={onClose}>
      <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>Settings</h1>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          width: '100%',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {buttons}
      </div>
    </Modal>
  );
};

export default SettingsModal;
