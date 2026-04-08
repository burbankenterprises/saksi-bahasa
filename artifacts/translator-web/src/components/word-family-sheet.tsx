import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useGetWordFamily } from "@workspace/api-client-react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WordFamilySheetProps {
  word: string;
  context?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WordFamilySheet({ word, context, open, onOpenChange }: WordFamilySheetProps) {
  const [hasFetched, setHasFetched] = useState(false);
  
  const { data: wordFamilyData, isPending, mutate: fetchWordFamily } = useGetWordFamily();

  React.useEffect(() => {
    if (open && word && !hasFetched) {
      setHasFetched(true);
      fetchWordFamily({ data: { word, context } });
    } else if (!open) {
      setHasFetched(false);
    }
  }, [open, word, context, fetchWordFamily, hasFetched]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] sm:h-full sm:max-w-md sm:side-right border-l-0 rounded-t-3xl sm:rounded-none bg-background p-0">
        <SheetHeader className="p-6 pb-2 text-left bg-muted/30 sticky top-0 z-10 backdrop-blur-xl border-b">
          <SheetTitle className="flex items-center gap-3 text-2xl font-serif">
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-md tracking-wide font-medium">
              {word}
            </span>
            {wordFamilyData && !isPending && (
              <span className="text-muted-foreground text-lg font-sans font-normal opacity-80">
                {wordFamilyData.briefMeaning}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(85vh-80px)] sm:h-[calc(100vh-80px)] px-6 pb-8">
          {isPending ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Analyzing word meaning...</p>
            </div>
          ) : wordFamilyData ? (
            <div className="flex flex-col gap-8 pt-6 pb-12">
              
              {/* Section 1: In action */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground border-b pb-2">
                  <span className="text-primary mr-2">1.</span>
                  "{wordFamilyData.word}" in action
                </h3>
                <div className="space-y-4">
                  {wordFamilyData.inAction.map((item, idx) => (
                    <div key={idx} className="bg-card p-4 rounded-xl border shadow-sm">
                      <p className="text-foreground font-medium mb-2">{item.indonesian}</p>
                      <div className="flex gap-2">
                        <span className="text-xs font-semibold text-muted-foreground mt-0.5">{idx + 1}</span>
                        <p className="text-muted-foreground text-sm leading-relaxed">{item.english}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Word family */}
              {wordFamilyData.wordFamily && wordFamilyData.wordFamily.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground border-b pb-2">
                    <span className="text-primary mr-2">2.</span>
                    Word family in action
                  </h3>
                  <div className="space-y-3">
                    {wordFamilyData.wordFamily.map((item, idx) => (
                      <div key={idx} className="bg-card p-4 rounded-xl border shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-primary/90 text-lg">{item.word}</span>
                          <span className="text-xs font-medium px-2 py-1 bg-secondary text-secondary-foreground rounded-md">
                            {item.meaning}
                          </span>
                        </div>
                        <div className="mt-2 border-t pt-2 border-border/50">
                          <p className="text-foreground text-sm font-medium">{item.exampleIndonesian}</p>
                          <p className="text-muted-foreground text-sm mt-1">{item.exampleEnglish}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: When to use */}
              {wordFamilyData.whenToUse && wordFamilyData.whenToUse.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground border-b pb-2">
                    <span className="text-primary mr-2">3.</span>
                    When to use "{wordFamilyData.word}"
                  </h3>
                  <div className="space-y-3">
                    {wordFamilyData.whenToUse.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`p-5 rounded-xl border shadow-sm ${
                          item.isThisWord 
                            ? 'bg-primary/5 border-primary/20 relative overflow-hidden' 
                            : 'bg-card border-border/60'
                        }`}
                      >
                        {item.isThisWord && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        )}
                        <div className="flex justify-between items-center mb-3">
                          <span className={`font-bold text-lg ${item.isThisWord ? 'text-primary' : 'text-foreground'}`}>
                            {item.word}
                          </span>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                            item.isThisWord ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {item.label}
                          </span>
                        </div>
                        {item.whatItMeans && (
                          <p className="text-sm font-medium mb-3 text-foreground/80">{item.whatItMeans}</p>
                        )}
                        <div className="flex gap-2 items-start mb-4 bg-background/50 p-2 rounded-lg border border-border/30">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{item.whenToUse}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.exampleIndonesian}</p>
                          <p className="text-sm text-muted-foreground mt-1">{item.exampleEnglish}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <p>Failed to load word details.</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
