'use client';

import { type ReactNode, useEffect, useId, useRef } from 'react';

type ModalSize = 'md' | 'lg';
type ModalVariant = 'default' | 'flush';

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  variant?: ModalVariant;
  closeLabel?: string;
};

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = 'md',
  variant = 'default',
  closeLabel = 'Close',
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const className = [
    'modal',
    `modal--${size}`,
    variant === 'flush' ? 'modal--flush' : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <dialog
      ref={dialogRef}
      className={className}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal__panel" onClick={(event) => event.stopPropagation()}>
        <header className="modal__header">
          <h2 id={titleId} className="modal__title">
            {title}
          </h2>
          <button
            type="button"
            className="btn-secondary modal__close"
            onClick={onClose}
            aria-label={closeLabel}
          >
            {closeLabel}
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer ? <footer className="modal__footer">{footer}</footer> : null}
      </div>
    </dialog>
  );
}
