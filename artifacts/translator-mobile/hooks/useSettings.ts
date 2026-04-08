import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const STORAGE_KEY = "@saksi_bahasa_settings";

const defaultSettings: AppSettings = {
  jwTerms: [],
  excludedWords: [],
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            setSettings({ ...defaultSettings, ...JSON.parse(raw) });
          } catch {}
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  const persist = useCallback(async (next: AppSettings) => {
    setSettings(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addJWTerm = useCallback(
    async (english: string, indonesian: string) => {
      await persist({
        ...settings,
        jwTerms: [
          ...settings.jwTerms,
          { id: Date.now().toString(), english: english.trim(), indonesian: indonesian.trim() },
        ],
      });
    },
    [settings, persist]
  );

  const editJWTerm = useCallback(
    async (id: string, english: string, indonesian: string) => {
      await persist({
        ...settings,
        jwTerms: settings.jwTerms.map((t) =>
          t.id === id ? { ...t, english: english.trim(), indonesian: indonesian.trim() } : t
        ),
      });
    },
    [settings, persist]
  );

  const deleteJWTerm = useCallback(
    async (id: string) => {
      await persist({
        ...settings,
        jwTerms: settings.jwTerms.filter((t) => t.id !== id),
      });
    },
    [settings, persist]
  );

  const addExcludedWord = useCallback(
    async (word: string) => {
      const trimmed = word.trim();
      if (!trimmed) return;
      if (settings.excludedWords.some((w) => w.word.toLowerCase() === trimmed.toLowerCase())) return;
      await persist({
        ...settings,
        excludedWords: [
          ...settings.excludedWords,
          { id: Date.now().toString(), word: trimmed },
        ],
      });
    },
    [settings, persist]
  );

  const deleteExcludedWord = useCallback(
    async (id: string) => {
      await persist({
        ...settings,
        excludedWords: settings.excludedWords.filter((w) => w.id !== id),
      });
    },
    [settings, persist]
  );

  return {
    settings,
    loaded,
    addJWTerm,
    editJWTerm,
    deleteJWTerm,
    addExcludedWord,
    deleteExcludedWord,
  };
}
