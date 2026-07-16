import React from 'react';
import { motion } from 'framer-motion';

export default function StepHeader({ title, subtitle, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8 text-center"
    >
      {icon && (
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-3xl shadow-lg shadow-indigo-500/20">
          {icon}
        </div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-3 text-base text-gray-600 dark:text-gray-400 sm:text-lg"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
