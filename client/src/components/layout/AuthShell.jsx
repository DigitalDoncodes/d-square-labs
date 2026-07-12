import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

// Premium auth background: soft animated gradient blobs behind a glass card.
export default function AuthShell({ subtitle, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Ambient gradient blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-500/25"
        animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-500/25"
        animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-6 flex flex-col items-center gap-2">
          <Logo size="lg" showTagline />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="glass rounded-2xl p-6 shadow-xl shadow-indigo-500/5">{children}</div>
        <p className="mt-5 text-center text-[11px] text-gray-400 dark:text-gray-500">
          By continuing you agree to our{' '}
          <Link to="/terms" className="hover:text-gray-600 hover:underline dark:hover:text-gray-300">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="hover:text-gray-600 hover:underline dark:hover:text-gray-300">Privacy Policy</Link>.
          No tracking. No ads. Your data belongs to you.
        </p>
      </motion.div>
    </div>
  );
}
