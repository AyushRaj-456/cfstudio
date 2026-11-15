/**
 * CF Studio - Image Store (IndexedDB in extension origin)
 * Stores user-uploaded background images safely in extension origin.
 */

const DB_NAME = 'cfs';
const DB_VERSION = 1;
const STORE_NAME = 'images';
const BG_IMAGE_KEY = 'user-background';

// In-memory fallback for test environments without indexedDB
const memoryStore = new Map();

function openDatabase() {
  if (typeof indexedDB === 'undefined') {
    return null;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const imageStore = {
  /**
   * Saves an image record to IndexedDB.
   * @param {object} imageRecord { dataUrl: string, mimeType: string, width: number, height: number, updatedAt: number }
   * @returns {Promise<void>}
   */
  async saveImage(imageRecord) {
    const db = await openDatabase();
    if (!db) {
      memoryStore.set(BG_IMAGE_KEY, JSON.parse(JSON.stringify(imageRecord)));
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(imageRecord, BG_IMAGE_KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  },

  /**
   * Retrieves the saved background image record.
   * @returns {Promise<object|null>}
   */
  async getImage() {
    const db = await openDatabase();
    if (!db) {
      return memoryStore.get(BG_IMAGE_KEY) || null;
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(BG_IMAGE_KEY);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  },

  /**
   * Deletes the saved background image from IndexedDB.
   * @returns {Promise<void>}
   */
  async deleteImage() {
    const db = await openDatabase();
    if (!db) {
      memoryStore.delete(BG_IMAGE_KEY);
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(BG_IMAGE_KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  },
};
