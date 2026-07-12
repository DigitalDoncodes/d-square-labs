import { RefreshCw } from 'lucide-react';
import { usePWA } from '../../context/PWAContext';

export default function UpdateBanner() {
  const { updateAvailable, applyUpdate } = usePWA();
  if (!updateAvailable) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-indigo-600 px-4 py-2 text-xs font-semibold text-white print:hidden">
      <span>A new version of DATAD is available.</span>
      <button
        onClick={applyUpdate}
        className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1 transition-colors hover:bg-white/30"
      >
        <RefreshCw className="h-3 w-3" />
        Update now
      </button>
    </div>
  );
}
