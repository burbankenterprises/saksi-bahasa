import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, Trash2, Plus, Check, X, ArrowRight, Ban } from "lucide-react";
import type { JWTerm, ExcludedWord } from "@/hooks/useSettings";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jwTerms: JWTerm[];
  excludedWords: ExcludedWord[];
  onAddJWTerm: (english: string, indonesian: string) => void;
  onEditJWTerm: (id: string, english: string, indonesian: string) => void;
  onDeleteJWTerm: (id: string) => void;
  onAddExcludedWord: (word: string) => void;
  onDeleteExcludedWord: (id: string) => void;
}

function JWTermRow({
  term,
  onEdit,
  onDelete,
}: {
  term: JWTerm;
  onEdit: (id: string, english: string, indonesian: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [eng, setEng] = useState(term.english);
  const [ind, setInd] = useState(term.indonesian);

  const save = () => {
    if (!eng.trim() || !ind.trim()) return;
    onEdit(term.id, eng, ind);
    setEditing(false);
  };

  const cancel = () => {
    setEng(term.english);
    setInd(term.indonesian);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 py-2 border-b border-border/50 last:border-0">
        <Input
          value={eng}
          onChange={(e) => setEng(e.target.value)}
          placeholder="English"
          className="h-8 text-sm flex-1"
          onKeyDown={(e) => e.key === "Enter" && save()}
          autoFocus
        />
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <Input
          value={ind}
          onChange={(e) => setInd(e.target.value)}
          placeholder="Indonesian"
          className="h-8 text-sm flex-1"
          onKeyDown={(e) => e.key === "Enter" && save()}
        />
        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-green-600 hover:text-green-700" onClick={save}>
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={cancel}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0 group">
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="text-sm font-medium text-foreground truncate">{term.english}</span>
        <ArrowRight className="h-3 w-3 text-primary shrink-0" />
        <span className="text-sm text-primary font-medium truncate">{term.indonesian}</span>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => setEditing(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => onDelete(term.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function AddJWTermForm({
  onAdd,
  onCancel,
}: {
  onAdd: (english: string, indonesian: string) => void;
  onCancel: () => void;
}) {
  const [eng, setEng] = useState("");
  const [ind, setInd] = useState("");

  const submit = () => {
    if (!eng.trim() || !ind.trim()) return;
    onAdd(eng, ind);
    setEng("");
    setInd("");
    onCancel();
  };

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
      <Input
        value={eng}
        onChange={(e) => setEng(e.target.value)}
        placeholder="English term"
        className="h-8 text-sm flex-1"
        onKeyDown={(e) => e.key === "Enter" && submit()}
        autoFocus
      />
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <Input
        value={ind}
        onChange={(e) => setInd(e.target.value)}
        placeholder="Indonesian"
        className="h-8 text-sm flex-1"
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-green-600 hover:text-green-700" onClick={submit}>
        <Check className="h-3.5 w-3.5" />
      </Button>
      <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={onCancel}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function AddExcludedWordForm({
  onAdd,
  onCancel,
}: {
  onAdd: (word: string) => void;
  onCancel: () => void;
}) {
  const [word, setWord] = useState("");

  const submit = () => {
    if (!word.trim()) return;
    onAdd(word);
    setWord("");
    onCancel();
  };

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
      <Input
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Word to exclude"
        className="h-8 text-sm flex-1"
        onKeyDown={(e) => e.key === "Enter" && submit()}
        autoFocus
      />
      <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-green-600 hover:text-green-700" onClick={submit}>
        <Check className="h-3.5 w-3.5" />
      </Button>
      <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={onCancel}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function SettingsSheet({
  open,
  onOpenChange,
  jwTerms,
  excludedWords,
  onAddJWTerm,
  onEditJWTerm,
  onDeleteJWTerm,
  onAddExcludedWord,
  onDeleteExcludedWord,
}: SettingsSheetProps) {
  const [showAddTerm, setShowAddTerm] = useState(false);
  const [showAddExclude, setShowAddExclude] = useState(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle className="text-left text-lg font-semibold">Settings</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 pb-8">
          <div className="space-y-8 pt-6">

            <section>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">JW Term Overrides</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Force specific Indonesian words for English terms
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1.5 text-xs"
                  onClick={() => setShowAddTerm((v) => !v)}
                >
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </div>

              <div className="mt-3 rounded-xl border bg-card px-3">
                {jwTerms.length === 0 && !showAddTerm ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No overrides yet. Add one above.
                  </div>
                ) : (
                  jwTerms.map((term) => (
                    <JWTermRow
                      key={term.id}
                      term={term}
                      onEdit={onEditJWTerm}
                      onDelete={onDeleteJWTerm}
                    />
                  ))
                )}
                {showAddTerm && (
                  <AddJWTermForm
                    onAdd={(e, i) => { onAddJWTerm(e, i); setShowAddTerm(false); }}
                    onCancel={() => setShowAddTerm(false)}
                  />
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Example: <span className="font-medium">ministry → dinas</span> will prevent
                the AI from ever using "pelayanan" when translating "ministry".
              </p>
            </section>

            <section>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Excluded Words</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Indonesian words the AI must never use
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1.5 text-xs"
                  onClick={() => setShowAddExclude((v) => !v)}
                >
                  <Ban className="h-3 w-3" />
                  Exclude
                </Button>
              </div>

              <div className="mt-3 rounded-xl border bg-card px-3">
                {excludedWords.length === 0 && !showAddExclude ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No excluded words yet.
                  </div>
                ) : (
                  excludedWords.map((ew) => (
                    <div
                      key={ew.id}
                      className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0 group"
                    >
                      <span className="text-sm font-medium text-foreground line-through decoration-destructive/60">
                        {ew.word}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onDeleteExcludedWord(ew.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
                {showAddExclude && (
                  <AddExcludedWordForm
                    onAdd={(w) => { onAddExcludedWord(w); setShowAddExclude(false); }}
                    onCancel={() => setShowAddExclude(false)}
                  />
                )}
              </div>
            </section>

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
