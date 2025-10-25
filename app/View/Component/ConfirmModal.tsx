import React, {useEffect, useRef} from 'react';

interface ModalActionProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    modalProps: ModalProps
}

interface ModalProps {
    header: string;
    message: string;
    yes: string;
    no: string;
    disableSubmit: boolean
}
function ConfirmModal({isOpen, onConfirm, onCancel, modalProps}: ModalActionProps) {

    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen && dialogRef.current) {
            dialogRef.current.showModal();
        } else if (!isOpen && dialogRef.current) {
            dialogRef.current.close();
        }
    }, [isOpen]);


    if (!isOpen) return null;
    const closeModal = () => {
        if (dialogRef.current) {
            onCancel();
            dialogRef.current.close();
        }
    };

    const disableSubmit = modalProps?.yes && !modalProps.disableSubmit;
    return (
        <dialog ref={dialogRef} className="modal modal-top">
            <div className="modal-box modal-box max-w-sm mx-auto mt-6 rounded-xl">
                {modalProps?.header && <h3 className="font-bold text-lg">{modalProps.header}</h3>}
                <p className="py-4">{modalProps.message}</p>
                <div className="modal-action">
                    {disableSubmit && <button className="btn btn-primary" onClick={onConfirm}>{modalProps.yes}</button>}

                    {modalProps?.no && <button className="btn btn-error" onClick={closeModal}>{modalProps.no}</button>}
                </div>
            </div>
        </dialog>
    );
}

export default ConfirmModal;