import React from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    // Use a portal to render the modal at the top level of the DOM
    return createPortal(
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-hud-surface border border-hud-border rounded-lg shadow-2xl p-6 w-full max-w-md m-4"
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
            >
                {children}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
