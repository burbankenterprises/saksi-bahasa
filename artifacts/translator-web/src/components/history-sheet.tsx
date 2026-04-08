import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bookmark, BookmarkCheck, Trash2, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import type { HistoryEntry } from "@/hooks/useHistory";

const REGION_LABELS: Record<string, string> = {
  jakarta: "🏙️ Jakarta",
  java: "🌋 Jawa",
  sunda: "🌿 Sunda",
  minang: "🏔️ Minang",
  batak: "🪘 Batak",
  bali: "🌺 Bali",
  makassar: "⚓ Makassar",
  manado: "🌊 Manado",
};

function timeAgo(ts: number): string {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function HistoryCard({
  entry,
  onToggleSaved,
  onDelete,
  onRestore,
}: {
  entry: HistoryEntry;
  onToggleSaved: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (text: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        entry.saved
          ? "border-primary/30 bg-primary/5"
          : "border-border/50 bg-card hover:border-border"
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] text-muted-foreground">{timeAgo(entry.timestamp)}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                entry.localSlang
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {entry.localSlang ? REGION_LABELS[entry.region] ?? entry.region : "🌐 Universal"}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">
            {entry.inputText}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1 italic">
            {entry.translations.formal.indonesian}
          </p>
        </div>
        <div className="flex flex-col gap-1 shrink-0 ml-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onToggleSaved(entry.id)}
            title={entry.saved ? "Remove from saved" : "Save this entry"}
          >
            {entry.saved ? (
              <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(entry.id)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/40">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 text-xs text-muted-foreground hover:text-foreground px-2"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Less" : "All translations"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 text-xs text-muted-foreground hover:text-foreground px-2 ml-auto"
          onClick={() => onRestore(entry.inputText)}
          title="Restore this text to the translator"
        >
          <RotateCcw className="h-3 w-3" />
          Restore
        </Button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3">
          {(
            [
              { key: "casual", label: "Casual", color: "text-green-600 dark:text-green-400" },
              { key: "polite", label: "Polite", color: "text-blue-600 dark:text-blue-400" },
              { key: "formal", label: "Formal", color: "text-primary" },
            ] as const
          ).map(({ key, label, color }) => (
            <div key={key} className="rounded-lg bg-muted/40 p-3">
              <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${color}`}>
                {label}
              </p>
              <p className="text-sm text-foreground">{entry.translations[key].indonesian}</p>
              <p className="text-xs text-muted-foreground italic mt-1 font-mono">
                {entry.translations[key].literal}
              </p>
              {key === "casual" && entry.translations.casual.slangExplanation && (
                <p className="text-xs text-muted-foreground mt-1.5 pt-1.5 border-t border-border/40">
                  {entry.translations.casual.slangExplanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface HistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: HistoryEntry[];
  onToggleSaved: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onRestore: (text: string) => void;
}

export function HistorySheet({
  open,
  onOpenChange,
  entries,
  onToggleSaved,
  onDelete,
  onClearAll,
  onRestore,
}: HistorySheetProps) {
  const [filter, setFilter] = useState<"all" | "saved">("all");

  const shown = filter === "saved" ? entries.filter((e) => e.saved) : entries;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-left text-lg font-semibold">History</SheetTitle>
            {entries.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => {
                  if (confirm("Clear all history? Saved entries will also be removed.")) {
                    onClearAll();
                  }
                }}
              >
                Clear all
              </Button>
            )}
          </div>
          <div className="flex gap-1 mt-3">
            {(["all", "saved"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors capitalize ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "saved" ? "⭐ Saved" : `All (${entries.length})`}
              </button>
            ))}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 pb-6">
          <div className="space-y-3 pt-4">
            {shown.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <span className="text-4xl">📖</span>
                <p className="text-sm font-medium text-foreground">
                  {filter === "saved" ? "No saved translations yet" : "No history yet"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {filter === "saved"
                    ? "Tap the bookmark icon on any translation to save it."
                    : "Your translations will appear here automatically."}
                </p>
              </div>
            ) : (
              shown.map((entry) => (
                <HistoryCard
                  key={entry.id}
                  entry={entry}
                  onToggleSaved={onToggleSaved}
                  onDelete={onDelete}
                  onRestore={(text) => {
                    onRestore(text);
                    onOpenChange(false);
                  }}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
