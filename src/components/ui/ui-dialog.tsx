import React from "react";

interface UiDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  disableOutsideClickClose?: boolean;
}

const UiDialog: React.FC<UiDialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  disableOutsideClickClose = false,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (!disableOutsideClickClose) {
      onClose();
    }
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="dialog-container" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="dialog-header">
            <h3>{title}</h3>
            <button className="close-btn" onClick={onClose}>
              &times;
            </button>
          </div>
        )}
        <div className="dialog-body">{children}</div>
      </div>
      <style>{`
        .dialog-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .dialog-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideIn 0.3s ease-out;
        }
        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }
        .dialog-header h3 {
          margin: 0;
          font-size: 1.2rem;
          color: #333;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        }
        .dialog-body {
          padding: 1rem;
        }
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default UiDialog;
