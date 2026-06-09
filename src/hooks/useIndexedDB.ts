import { useEffect, useRef, useState } from "react";
import type { UseIndexedDBReturn } from "../types";

const DB_NAME = "QuantumPlaceDB";
const DB_VERSION = 1;
const STORE_NAME = "canvas";
const PIXEL_KEY = "pixelData";
const CANVAS_SIZE = 2048;
const BUFFER_SIZE = CANVAS_SIZE * CANVAS_SIZE * 4;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export function useIndexedDB(): UseIndexedDBReturn {
  const [isReady, setIsReady] = useState(false);
  const dbRef = useRef<IDBDatabase | null>(null);

  useEffect(() => {
    openDB()
      .then((db) => {
        dbRef.current = db;
        setIsReady(true);
      })
      .catch((err) => {
        console.error("IndexedDB open failed:", err);
      });
    return () => {
      dbRef.current?.close();
    };
  }, []);

  const loadPixelData = (): Promise<Uint8ClampedArray | null> => {
    return new Promise((resolve, reject) => {
      if (!dbRef.current) {
        resolve(null);
        return;
      }
      const tx = dbRef.current.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(PIXEL_KEY);
      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result as ArrayBuffer | undefined;
        if (result) {
          resolve(new Uint8ClampedArray(result));
        } else {
          resolve(null);
        }
      };
      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  };

  const savePixelData = (data: Uint8ClampedArray): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!dbRef.current) {
        resolve();
        return;
      }
      const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + BUFFER_SIZE);
      const tx = dbRef.current.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(buffer, PIXEL_KEY);
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  };

  return { loadPixelData, savePixelData, isReady };
}
