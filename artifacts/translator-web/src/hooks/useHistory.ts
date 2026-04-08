import { useState, useEffect, useCallback } from "react";
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

const STORAGE_KEY = "saksi_bahasa_history";
const MAX_UNSAVED = 50;

function load(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as HistoryEntry[];
  } catch {}
  return [];
}

function persist(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

function prune(entries: HistoryEntry[]): HistoryEntry[] {
  const saved = entries.filter((e) => e.saved);
  const unsaved = entries.filter((e) => !e.saved);
  const trimmed = unsaved.slice(0, MAX_UNSAVED);
  return [...saved, ...trimmed].sort((a, b) => b.timestamp - a.timestamp);
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(load());
  }, []);

  const update = useCallback((next: HistoryEntry[]) => {
    const pruned = prune(next);
    setEntries(pruned);
    persist(pruned);
  }, []);

  const addEntry = useCallback(
    (data: Omit<HistoryEntry, "id" | "timestamp" | "saved">) => {
      const entry: HistoryEntry = {
        ...data,
        id: Date.now().toString(),
        timestamp: Date.now(),
        saved: false,
      };
      update([entry, ...load()]);
    },
    [update]
  );

  const toggleSaved = useCallback(
    (id: string) => {
      update(load().map((e) => (e.id === id ? { ...e, saved: !e.saved } : e)));
    },
    [update]
  );

  const deleteEntry = useCallback(
    (id: string) => {
      update(load().filter((e) => e.id !== id));
    },
    [update]
  );

  const clearAll = useCallback(() => {
    update([]);
  }, [update]);

  return { entries, addEntry, toggleSaved, deleteEntry, clearAll };
}
