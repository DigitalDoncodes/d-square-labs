// Queue API mutations while offline; flush via Background Sync when online.
// Usage: const { enqueue } = useOfflineQueue();
//        await enqueue('/api/notes', 'POST', body);

import { useCallback } from 'react';

const DB_NAME = 'datad-sync-queue';
const STORE = 'queue';
const SYNC_TAG = 'datad-background-sync';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function addToQueue(url, method, body, headers = {}) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).add({
      url,
      method,
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers,
      createdAt: new Date().toISOString(),
    });
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function registerSync() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    if (reg.sync) {
      await reg.sync.register(SYNC_TAG);
    } else if (navigator.onLine) {
      // iOS Safari / Firefox: no Sync API — ask the SW to flush directly.
      // If we're offline, PWAContext sends FLUSH_QUEUE on the next 'online' event.
      reg.active?.postMessage({ type: 'FLUSH_QUEUE' });
    }
  } catch {
    // Sync registration failed — queue flushes on next online event
  }
}

export function useOfflineQueue() {
  const enqueue = useCallback(async (url, method, body, headers = {}) => {
    await addToQueue(url, method, body, headers);
    await registerSync();
  }, []);

  return { enqueue };
}
