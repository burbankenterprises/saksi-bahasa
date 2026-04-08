import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { IndonesianRegion } from "@workspace/api-client-react/src/generated/api.schemas";

export interface HistoryTranslations {
  casual: { indonesian: string; literal: string; slangExplanation?: string };
  polite: { indonesian: string; literal: string };
  formal: { indonesian: string; literal: string };
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  inputText: string;
  region: IndonesianRegion;
  localSlang: boolean;
  translations: HistoryTranslations;
  saved: boolean;
}

const STORAGE_KEY = "@saksi_bahasa_history";
const MAX_UNSAVED = 50;

function prune(entries: HistoryEntry[]): HistoryEntry[] {
  const saved = entries.filter((e) => e.saved);
  const unsaved = entries.filter((e) => !e.saved);
  return [...saved, ...unsaved.slice(0, MAX_UNSAVED)].sort(
    (a, b) => b.timestamp - a.timestamp
  );
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setEntries(JSON.parse(raw) as HistoryEntry[]);
      })
      .finally(() => setLoaded(true));
  }, []);

  const persist = useCallback(async (next: HistoryEntry[]) => {
    const pruned = prune(next);
    setEntries(pruned);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
  }, []);

  const addEntry = useCallback(
    async (data: Omit<HistoryEntry, "id" | "timestamp" | "saved">) => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const current: HistoryEntry[] = raw ? JSON.parse(raw) : [];
      const entry: HistoryEntry = {
        ...data,
        id: Date.now().toString(),
        timestamp: Date.now(),
        saved: false,
      };
      await persist([entry, ...current]);
    },
    [persist]
  );

  const toggleSaved = useCallback(
    async (id: string) => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const current: HistoryEntry[] = raw ? JSON.parse(raw) : [];
      await persist(current.map((e) => (e.id === id ? { ...e, saved: !e.saved } : e)));
    },
    [persist]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const current: HistoryEntry[] = raw ? JSON.parse(raw) : [];
      await persist(current.filter((e) => e.id !== id));
    },
    [persist]
  );

  const clearAll = useCallback(async () => {
    await persist([]);
  }, [persist]);

  const refresh = useCallback(async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) setEntries(JSON.parse(raw) as HistoryEntry[]);
  }, []);

  return { entries, loaded, addEntry, toggleSaved, deleteEntry, clearAll, refresh };
}
