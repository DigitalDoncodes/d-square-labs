import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — DATAD` : 'DATAD';
    return () => { document.title = prev; };
  }, [title]);
}
