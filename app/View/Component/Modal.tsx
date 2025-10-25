import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    return (
        <dialog id="custom_modal" className={`modal ${isOpen ? 'modal-open' : ''}`}>
            <div className="modal-box relative">
                <form method="dialog">
                    <button
                        type="button"
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </form>
                {title && <h3 className="font-bold text-lg mb-4">{title}</h3>}
                {children}
            </div>
        </dialog>
    );
}

export default Modal;