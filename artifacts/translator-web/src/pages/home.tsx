import React, { useState } from "react";
import { useTranslate } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Moon,
  Sun,
  ArrowRightLeft,
  BookOpen,
  Copy,
  Check,
  Settings,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { WordFamilySheet } from "@/components/word-family-sheet";
import { SettingsSheet } from "@/components/settings-sheet";
import { useSettings } from "@/hooks/useSettings";
import type { TranslationStyle } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Home() {
  const [text, setText] = useState("");
  const { theme, setTheme } = useTheme();
  const [selectedWord, setSelectedWord] = useState<{ word: string; context: string } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data: translations, isPending, mutate: translateText } = useTranslate();

  const {
    settings,
    addJWTerm,
    editJWTerm,
    deleteJWTerm,
    addExcludedWord,
    deleteExcludedWord,
  } = useSettings();

  const handleTranslate = () => {
    if (!text.trim()) return;
    translateText({
      data: {
        text,
        jwTerms: settings.jwTerms.map(({ english, indonesian }) => ({ english, indonesian })),
        excludedWords: settings.excludedWords.map((w) => w.word),
      },
    });
  };

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleWordClick = (wordText: string, contextSentence: string) => {
    const cleanWord = wordText.replace(/[.,!?()[\]{}"'""]/g, "").toLowerCase();
    if (!cleanWord) return;
    setSelectedWord({ word: cleanWord, context: contextSentence });
  };

  const renderClickableSentence = (translation: TranslationStyle) => {
    const words = translation.indonesian.split(/\s+/);
    return (
      <div className="leading-relaxed">
        {words.map((word, idx) => (
          <React.Fragment key={idx}>
            <span
              onClick={() => handleWordClick(word, translation.indonesian)}
              className="cursor-pointer hover:text-primary hover:bg-primary/10 rounded px-0.5 transition-colors duration-200 inline-block"
            >
              {word}
            </span>
            {" "}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const STYLES = [
    {
      key: "casual",
      label: "Casual",
      badge: "Friendly / Slang",
      dot: "bg-green-500",
      data: translations?.casual,
    },
    {
      key: "polite",
      label: "Polite",
      badge: "Public / Respectful",
      dot: "bg-blue-500",
      data: translations?.polite,
    },
    {
      key: "formal",
      label: "Formal",
      badge: "JW Meeting",
      dot: "bg-primary",
      data: translations?.formal,
      highlight: true,
    },
  ] as const;

  return (
    <div className="min-h-screen w-full bg-background flex flex-col font-sans transition-colors duration-300">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-xl font-serif font-bold text-foreground tracking-tight">Saksi Bahasa</h1>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="rounded-full w-9 h-9 hover:bg-muted relative"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
              {(settings.jwTerms.length > 0 || settings.excludedWords.length > 0) && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full w-9 h-9 hover:bg-muted"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-primary transition-shadow">
            <Textarea
              placeholder="Enter English text to translate..."
              className="min-h-[120px] resize-none border-0 focus-visible:ring-0 rounded-none bg-transparent p-5 text-lg placeholder:text-muted-foreground/60"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleTranslate();
              }}
            />
            <div className="p-3 bg-muted/30 border-t flex justify-end">
              <Button
                onClick={handleTranslate}
                disabled={!text.trim() || isPending}
                className="rounded-xl px-6 font-medium shadow-sm"
              >
                {isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Translating...</>
                ) : (
                  <><ArrowRightLeft className="mr-2 h-4 w-4" /> Translate</>
                )}
              </Button>
            </div>
          </div>
        </section>

        {translations && (
          <section className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground ml-2">
              Translations
            </h2>

            <div className="grid gap-5">
              {STYLES.map(({ key, label, badge, dot, data, highlight }) =>
                data ? (
                  <div
                    key={key}
                    className={`bg-card rounded-2xl p-6 border shadow-sm hover:border-primary/30 transition-colors ${
                      highlight ? "border-primary/20 bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-2 h-2 rounded-full ${dot}`} />
                      <h3 className={`font-semibold ${highlight ? "text-primary" : "text-foreground"}`}>
                        {label}
                      </h3>
                      <span
                        className={`text-xs ml-auto px-2 py-0.5 rounded-md font-medium ${
                          highlight
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {badge}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-1 shrink-0"
                        title="Copy translation"
                        onClick={() => handleCopy(key, data.indonesian)}
                      >
                        {copiedKey === key ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <div className="text-xl font-medium text-foreground mb-3">
                      {renderClickableSentence(data)}
                    </div>
                    <div className={`pt-3 border-t ${highlight ? "border-primary/20" : "border-border/50"}`}>
                      <p className="text-sm text-muted-foreground font-mono">{data.literal}</p>
                    </div>
                  </div>
                ) : null
              )}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4 italic">
              Tap any word in the translations to see its meaning and family.
            </p>
          </section>
        )}
      </main>

      <WordFamilySheet
        word={selectedWord?.word || ""}
        context={selectedWord?.context}
        open={!!selectedWord}
        onOpenChange={(open) => !open && setSelectedWord(null)}
      />

      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        jwTerms={settings.jwTerms}
        excludedWords={settings.excludedWords}
        onAddJWTerm={addJWTerm}
        onEditJWTerm={editJWTerm}
        onDeleteJWTerm={deleteJWTerm}
        onAddExcludedWord={addExcludedWord}
        onDeleteExcludedWord={deleteExcludedWord}
      />
    </div>
  );
}
