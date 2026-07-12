import { useEffect, useRef, useState } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { usePWA } from '../../context/PWAContext';

export default function OfflineBanner() {
  const { isOnline, syncing } = usePWA();
  const [visible, setVisible] = useState(false);
  const [justOnline, setJustOnline] = useState(false);
  // Track whether we've gone offline at least once this session
  const wentOffline = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wentOffline.current = true;
      setVisible(true);
      setJustOnline(false);
    } else if (wentOffline.current) {
      // Came back online after being offline — show brief "Back online" toast
      setJustOnline(true);
      const t = setTimeout(() => {
        setVisible(false);
        setJustOnline(false);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [isOnline]);

  if (!visible) return null;

  if (justOnline) {
    return (
      <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-emerald-500 px-4 py-2 text-center text-xs font-semibold text-white print:hidden">
        {syncing ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Syncing your changes…
          </>
        ) : (
          <>
            <Wifi className="h-3.5 w-3.5" />
            Back online
          </>
        )}
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-xs font-semibold text-white print:hidden">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      You're offline — showing last synced information
    </div>
  );
}
