import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

// Calm, focused auth screen: one card, one purpose, no decoration by default.
// `background` lets a specific page (login, register) render its own
// full-bleed layer behind the card; `maxWidth` widens the card itself for
// forms with more fields than a single email/password pair.
export default function AuthShell({
  subtitle,
  children,
  background,
  maxWidth = 'max-w-sm',
  cardClassName = 'rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-gray-800/80 dark:bg-gray-900',
  subtitleClassName = 'mt-2 text-sm text-gray-500 dark:text-gray-400',
  footerClassName = 'mt-5 text-center text-[11px] text-gray-400 dark:text-gray-500',
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {background}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-10 w-full ${maxWidth}`}
      >
        <div className="mb-6 flex flex-col items-center gap-2">
          <Logo size="lg" showTagline />
          <p className={subtitleClassName}>{subtitle}</p>
        </div>
        <div className={cardClassName}>{children}</div>
        <p className={footerClassName}>
          By continuing you agree to our{' '}
          <Link to="/terms" className="hover:underline">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>.
          No tracking. No ads. Your data belongs to you.
        </p>
      </motion.div>
    </div>
  );
}
