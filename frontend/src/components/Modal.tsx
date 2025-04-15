import React from 'react';
import './Modal.css';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  visible: boolean;
}

function Modal({ children, onClose, visible }: ModalProps) {
  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default Modal;
