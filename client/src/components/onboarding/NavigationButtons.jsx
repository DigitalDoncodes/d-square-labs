import React from 'react';
import { motion } from 'framer-motion';

export default function NavigationButtons({
  canGoBack,
  onBack,
  onNext,
  isLoading,
  showSubmit = false,
  onSubmit,
  nextLabel = 'Continue',
  submitLabel = 'Create My Workspace',
  disabled = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-auto flex items-center justify-between gap-4"
    >
      {canGoBack ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={onBack}
          className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Back
        </motion.button>
      ) : (
        <div />
      )}

      {showSubmit ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          onClick={onSubmit}
          disabled={isLoading || disabled}
          className="relative flex-1 overflow-hidden rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-indigo-500 disabled:opacity-50"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {submitLabel}
              </>
            ) : (
              submitLabel
            )}
          </span>
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onNext}
          disabled={isLoading || disabled}
          className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-indigo-500 disabled:opacity-50"
        >
          {isLoading ? (
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            nextLabel
          )}
        </motion.button>
      )}
    </motion.div>
  );
}
