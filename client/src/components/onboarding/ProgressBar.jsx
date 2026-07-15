import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressBar({ currentStep, totalSteps, showLabels = true }) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const steps = [
    { id: 0, label: 'Welcome', icon: '👋' },
    { id: 1, label: 'About', icon: '👤' },
    { id: 2, label: 'Education', icon: '🎓' },
    { id: 3, label: 'Interests', icon: '🎯' },
    { id: 4, label: 'Skills', icon: '⚡' },
    { id: 5, label: 'Goals', icon: 'ลุ' },
    { id: 6, label: 'Learning', icon: '🧠' },
    { id: 7, label: 'Review', icon: '✅' },
  ];

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Step {currentStep} of {totalSteps}
          </span>
          <div className="h-1 w-12 rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          {Math.round(progress)}% Complete
        </span>
      </div>

      <div className="flex justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {steps.slice(0, totalSteps).map((step, index) => {
          const isCompleted = index < currentStep - 1;
          const isActive = index === currentStep - 1;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`flex flex-col items-center gap-1 flex-shrink-0`}
              aria-current={isActive ? 'step' : undefined}
            >
              <div
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300
                  ${isActive
                    ? 'border-indigo-600 bg-indigo-600 text-white ring-4 ring-indigo-600/20'
                    : isCompleted
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{step.icon}</span>
                )}
              </div>
              {showLabels && (
                <span
                  className={`text-[10px] font-medium transition-colors duration-300
                    ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}
                    ${isCompleted ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}
                  `}
                >
                  {step.label}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
