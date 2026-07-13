import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable confirmation dialog built on the same design language as Modal.
 *
 * Props:
 *   open        boolean
 *   onClose     () => void   — cancel / close without confirming
 *   onConfirm   () => void   — confirm action
 *   title       string
 *   message     string
 *   danger      boolean      — confirm button turns red
 *   confirmLabel string      — defaults to "Confirm"
 *   cancelLabel  string      — defaults to "Cancel"
 */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  danger = false,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}) {
  const confirmRef = useRef(null);

  // Keyboard: Escape → cancel, Enter → confirm (when confirm button is focused)
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    // Focus the confirm button so Enter works immediately
    const t = setTimeout(() => confirmRef.current?.focus(), 50);
    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={message ? 'confirm-message' : undefined}
        className="animate-in w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-black/10 dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 id="confirm-title" className="text-base font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {message && (
          <p id="confirm-message" className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {message}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={() => { onConfirm(); onClose(); }}
            className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors duration-150 ${
              danger
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
