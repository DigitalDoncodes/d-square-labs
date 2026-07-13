import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

// Calm, focused auth screen: one card, one purpose, no decoration.
export default function AuthShell({ subtitle, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-6 flex flex-col items-center gap-2">
          <Logo size="lg" showTagline />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-gray-800/80 dark:bg-gray-900">{children}</div>
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
