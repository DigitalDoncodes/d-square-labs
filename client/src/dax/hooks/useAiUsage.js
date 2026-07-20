import { useEffect, useState } from 'react';
import api from '../../api/axios';

export function useAiUsage() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/dax/usage');
        setUsage(res.data);
      } catch (err) {
        console.error('Failed to fetch usage:', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { usage, loading };
}
