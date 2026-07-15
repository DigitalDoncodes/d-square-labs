import React from 'react';
import { motion } from 'framer-motion';

export default function Card({ children, className = '', onClick, selected = false, disabled = false }) {
  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={!disabled ? onClick : undefined}
      className={`
        relative rounded-2xl border p-5 transition-all duration-200
        ${disabled
          ? 'cursor-not-allowed opacity-50'
          : onClick && selected
            ? 'border-2 border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20'
            : onClick
              ? 'border border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-700 dark:hover:bg-gray-700/50'
              : 'border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
        }
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

export function ChoiceCard({ title, subtitle, selected = false, onClick, icon }) {
  return (
    <Card onClick={onClick} selected={selected} className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      {selected && (
        <motion.div
          layoutId="choice-badge"
          className="absolute top-4 right-4 z-10 rounded-full bg-indigo-600 p-1.5"
        >
          <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
    </Card>
  );
}

export function Chip({ label, onRemove, onClick, selected = false }) {
  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all
        ${selected
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        }
      `}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="rounded-full p-0.5 hover:bg-white/30 focus:outline-none focus:ring-1 focus:ring-white/50"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
