import { useCallback, useEffect, useState } from 'react';
import type { AppSettings, DocumentRecord } from '../types/document';
import {
  deleteDocument,
  loadDocuments,
  loadSettings,
  saveSettings,
  upsertDocument,
} from '../utils/storage';

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDocuments(loadDocuments());
    setReady(true);
  }, []);

  const save = useCallback((doc: DocumentRecord) => {
    const next = upsertDocument(doc);
    setDocuments(next);
    return next;
  }, []);

  const remove = useCallback((id: string) => {
    const next = deleteDocument(id);
    setDocuments(next);
  }, []);

  const refresh = useCallback(() => {
    setDocuments(loadDocuments());
  }, []);

  return { documents, ready, save, remove, refresh };
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const update = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  return { settings, update };
}
