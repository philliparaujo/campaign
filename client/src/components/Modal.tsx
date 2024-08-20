import React from 'react';
import './Modal.css';

interface ModalProps {
  show: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {onClose && (
          <button className="modal-close-button" onClick={onClose}>
            &times; {/* 'X' button */}
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
