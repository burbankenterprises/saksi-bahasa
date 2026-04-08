import { useState, useEffect, useCallback } from "react";

export interface JWTerm {
  id: string;
  english: string;
  indonesian: string;
}

export interface ExcludedWord {
  id: string;
  word: string;
}

export interface AppSettings {
  jwTerms: JWTerm[];
  excludedWords: ExcludedWord[];
}

const STORAGE_KEY = "saksi_bahasa_settings";

const defaultSettings: AppSettings = {
  jwTerms: [],
  excludedWords: [],
};

function load(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return defaultSettings;
}

function save(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    setSettings(load());
  }, []);

  const update = useCallback((next: AppSettings) => {
    setSettings(next);
    save(next);
  }, []);

  const addJWTerm = useCallback(
    (english: string, indonesian: string) => {
      update({
        ...settings,
        jwTerms: [
          ...settings.jwTerms,
          { id: Date.now().toString(), english: english.trim(), indonesian: indonesian.trim() },
        ],
      });
    },
    [settings, update]
  );

  const editJWTerm = useCallback(
    (id: string, english: string, indonesian: string) => {
      update({
        ...settings,
        jwTerms: settings.jwTerms.map((t) =>
          t.id === id ? { ...t, english: english.trim(), indonesian: indonesian.trim() } : t
        ),
      });
    },
    [settings, update]
  );

  const deleteJWTerm = useCallback(
    (id: string) => {
      update({ ...settings, jwTerms: settings.jwTerms.filter((t) => t.id !== id) });
    },
    [settings, update]
  );

  const addExcludedWord = useCallback(
    (word: string) => {
      const trimmed = word.trim();
      if (!trimmed) return;
      if (settings.excludedWords.some((w) => w.word.toLowerCase() === trimmed.toLowerCase())) return;
      update({
        ...settings,
        excludedWords: [
          ...settings.excludedWords,
          { id: Date.now().toString(), word: trimmed },
        ],
      });
    },
    [settings, update]
  );

  const deleteExcludedWord = useCallback(
    (id: string) => {
      update({ ...settings, excludedWords: settings.excludedWords.filter((w) => w.id !== id) });
    },
    [settings, update]
  );

  return {
    settings,
    addJWTerm,
    editJWTerm,
    deleteJWTerm,
    addExcludedWord,
    deleteExcludedWord,
  };
}
