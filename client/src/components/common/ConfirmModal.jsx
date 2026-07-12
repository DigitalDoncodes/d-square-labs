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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={message ? 'confirm-message' : undefined}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900"
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
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={() => { onConfirm(); onClose(); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
              danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
