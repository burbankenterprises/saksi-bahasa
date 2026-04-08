import React, { useState } from "react";
import { useTranslate } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Moon, Sun, ArrowRightLeft, BookOpen } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { WordFamilySheet } from "@/components/word-family-sheet";
import type { TranslationStyle } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Home() {
  const [text, setText] = useState("");
  const { theme, setTheme } = useTheme();
  const [selectedWord, setSelectedWord] = useState<{word: string, context: string} | null>(null);

  const { data: translations, isPending, mutate: translateText } = useTranslate();

  const handleTranslate = () => {
    if (!text.trim()) return;
    translateText({ data: { text } });
  };

  const handleWordClick = (wordText: string, contextSentence: string) => {
    // Clean punctuation from word
    const cleanWord = wordText.replace(/[.,!?()[\]{}"'“”]/g, "").toLowerCase();
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
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full w-9 h-9 hover:bg-muted"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
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
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleTranslate();
                }
              }}
            />
            <div className="p-3 bg-muted/30 border-t flex justify-end">
              <Button 
                onClick={handleTranslate} 
                disabled={!text.trim() || isPending}
                className="rounded-xl px-6 font-medium shadow-sm hover-elevate active-elevate"
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
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground ml-2">Translations</h2>
            
            <div className="grid gap-5">
              {/* Casual */}
              <div className="bg-card rounded-2xl p-6 border shadow-sm hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <h3 className="font-semibold text-foreground">Casual</h3>
                  <span className="text-xs text-muted-foreground ml-auto bg-muted px-2 py-0.5 rounded-md font-medium">Friendly / Slang</span>
                </div>
                <div className="text-xl font-medium text-foreground mb-3">
                  {renderClickableSentence(translations.casual)}
                </div>
                <div className="pt-3 border-t border-border/50">
                  <p className="text-sm text-muted-foreground font-mono">
                    {translations.casual.literal}
                  </p>
                </div>
              </div>

              {/* Polite */}
              <div className="bg-card rounded-2xl p-6 border shadow-sm hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <h3 className="font-semibold text-foreground">Polite</h3>
                  <span className="text-xs text-muted-foreground ml-auto bg-muted px-2 py-0.5 rounded-md font-medium">Public / Respectful</span>
                </div>
                <div className="text-xl font-medium text-foreground mb-3">
                  {renderClickableSentence(translations.polite)}
                </div>
                <div className="pt-3 border-t border-border/50">
                  <p className="text-sm text-muted-foreground font-mono">
                    {translations.polite.literal}
                  </p>
                </div>
              </div>

              {/* Formal */}
              <div className="bg-card rounded-2xl p-6 border shadow-sm hover:border-primary/30 transition-colors border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <h3 className="font-semibold text-primary-foreground dark:text-primary">Formal</h3>
                  <span className="text-xs text-primary-foreground dark:text-primary ml-auto bg-primary/20 px-2 py-0.5 rounded-md font-medium">JW Meeting</span>
                </div>
                <div className="text-xl font-medium text-foreground mb-3">
                  {renderClickableSentence(translations.formal)}
                </div>
                <div className="pt-3 border-t border-primary/20">
                  <p className="text-sm text-muted-foreground font-mono">
                    {translations.formal.literal}
                  </p>
                </div>
              </div>
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
    </div>
  );
}
