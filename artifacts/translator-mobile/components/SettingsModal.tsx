import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import type { JWTerm, ExcludedWord } from "@/hooks/useSettings";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  jwTerms: JWTerm[];
  excludedWords: ExcludedWord[];
  onAddJWTerm: (english: string, indonesian: string) => Promise<void>;
  onEditJWTerm: (id: string, english: string, indonesian: string) => Promise<void>;
  onDeleteJWTerm: (id: string) => Promise<void>;
  onAddExcludedWord: (word: string) => Promise<void>;
  onDeleteExcludedWord: (id: string) => Promise<void>;
}

function JWTermRow({
  term,
  onEdit,
  onDelete,
  colors,
}: {
  term: JWTerm;
  onEdit: (id: string, english: string, indonesian: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  colors: ReturnType<typeof useColors>;
}) {
  const [editing, setEditing] = useState(false);
  const [eng, setEng] = useState(term.english);
  const [ind, setInd] = useState(term.indonesian);

  const save = async () => {
    if (!eng.trim() || !ind.trim()) return;
    await onEdit(term.id, eng, ind);
    Haptics.selectionAsync();
    setEditing(false);
  };

  const cancel = () => {
    setEng(term.english);
    setInd(term.indonesian);
    setEditing(false);
  };

  if (editing) {
    return (
      <View style={[styles.termRow, { borderBottomColor: colors.border }]}>
        <View style={styles.termEditRow}>
          <TextInput
            value={eng}
            onChangeText={setEng}
            placeholder="English"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.termInput, { backgroundColor: colors.secondary, color: colors.foreground }]}
            autoFocus
          />
          <Feather name="arrow-right" size={14} color={colors.primary} />
          <TextInput
            value={ind}
            onChangeText={setInd}
            placeholder="Indonesian"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.termInput, { backgroundColor: colors.secondary, color: colors.primary }]}
          />
        </View>
        <View style={styles.termEditActions}>
          <TouchableOpacity onPress={save} style={[styles.iconBtn, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="check" size={14} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={cancel} style={[styles.iconBtn, { backgroundColor: colors.secondary }]}>
            <Feather name="x" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.termRow, { borderBottomColor: colors.border }]}>
      <View style={styles.termDisplay}>
        <Text style={[styles.termEnglish, { color: colors.foreground }]} numberOfLines={1}>
          {term.english}
        </Text>
        <Feather name="arrow-right" size={12} color={colors.primary} style={{ marginHorizontal: 4 }} />
        <Text style={[styles.termIndonesian, { color: colors.primary }]} numberOfLines={1}>
          {term.indonesian}
        </Text>
      </View>
      <View style={styles.termActions}>
        <TouchableOpacity
          onPress={() => setEditing(true)}
          style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
        >
          <Feather name="edit-2" size={13} color={colors.mutedForeground} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await onDelete(term.id);
          }}
          style={[styles.iconBtn, { backgroundColor: colors.destructive + "18" }]}
        >
          <Feather name="trash-2" size={13} color={colors.destructive} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AddTermForm({
  onAdd,
  onCancel,
  colors,
}: {
  onAdd: (e: string, i: string) => Promise<void>;
  onCancel: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const [eng, setEng] = useState("");
  const [ind, setInd] = useState("");

  const submit = async () => {
    if (!eng.trim() || !ind.trim()) return;
    await onAdd(eng, ind);
    setEng("");
    setInd("");
  };

  return (
    <View style={[styles.addForm, { borderTopColor: colors.border }]}>
      <View style={styles.termEditRow}>
        <TextInput
          value={eng}
          onChangeText={setEng}
          placeholder="English term"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.termInput, { backgroundColor: colors.secondary, color: colors.foreground }]}
          autoFocus
        />
        <Feather name="arrow-right" size={14} color={colors.primary} />
        <TextInput
          value={ind}
          onChangeText={setInd}
          placeholder="Indonesian"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.termInput, { backgroundColor: colors.secondary, color: colors.primary }]}
        />
      </View>
      <View style={styles.termEditActions}>
        <TouchableOpacity
          onPress={submit}
          style={[styles.iconBtn, { backgroundColor: colors.primary + "22" }]}
        >
          <Feather name="check" size={14} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCancel}
          style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
        >
          <Feather name="x" size={14} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AddWordForm({
  onAdd,
  onCancel,
  colors,
}: {
  onAdd: (w: string) => Promise<void>;
  onCancel: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const [word, setWord] = useState("");

  const submit = async () => {
    if (!word.trim()) return;
    await onAdd(word);
    setWord("");
  };

  return (
    <View style={[styles.addForm, { borderTopColor: colors.border }]}>
      <TextInput
        value={word}
        onChangeText={setWord}
        placeholder="Word to exclude"
        placeholderTextColor={colors.mutedForeground}
        style={[styles.wordInput, { backgroundColor: colors.secondary, color: colors.foreground, flex: 1 }]}
        autoFocus
      />
      <TouchableOpacity
        onPress={submit}
        style={[styles.iconBtn, { backgroundColor: colors.primary + "22" }]}
      >
        <Feather name="check" size={14} color={colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onCancel}
        style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
      >
        <Feather name="x" size={14} color={colors.mutedForeground} />
      </TouchableOpacity>
    </View>
  );
}

export function SettingsModal({
  visible,
  onClose,
  jwTerms,
  excludedWords,
  onAddJWTerm,
  onEditJWTerm,
  onDeleteJWTerm,
  onAddExcludedWord,
  onDeleteExcludedWord,
}: SettingsModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [showAddTerm, setShowAddTerm] = useState(false);
  const [showAddWord, setShowAddWord] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: colors.secondary }]}
          >
            <Feather name="x" size={16} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitles}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  JW Term Overrides
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
                  Force specific Indonesian words for English terms
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => { setShowAddTerm((v) => !v); setShowAddWord(false); }}
                style={[styles.addBtn, { backgroundColor: colors.primary + "22" }]}
              >
                <Feather name="plus" size={14} color={colors.primary} />
                <Text style={[styles.addBtnText, { color: colors.primary }]}>Add</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {jwTerms.length === 0 && !showAddTerm ? (
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No overrides yet. Tap Add to create one.
                </Text>
              ) : (
                jwTerms.map((term) => (
                  <JWTermRow
                    key={term.id}
                    term={term}
                    onEdit={onEditJWTerm}
                    onDelete={onDeleteJWTerm}
                    colors={colors}
                  />
                ))
              )}
              {showAddTerm && (
                <AddTermForm
                  onAdd={async (e, i) => { await onAddJWTerm(e, i); setShowAddTerm(false); Haptics.selectionAsync(); }}
                  onCancel={() => setShowAddTerm(false)}
                  colors={colors}
                />
              )}
            </View>

            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              Example: <Text style={{ fontStyle: "italic" }}>ministry → dinas</Text> prevents the AI from using "pelayanan".
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitles}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Excluded Words
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
                  Indonesian words the AI must never use
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => { setShowAddWord((v) => !v); setShowAddTerm(false); }}
                style={[styles.addBtn, { backgroundColor: colors.destructive + "18" }]}
              >
                <Feather name="slash" size={14} color={colors.destructive} />
                <Text style={[styles.addBtnText, { color: colors.destructive }]}>Exclude</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {excludedWords.length === 0 && !showAddWord ? (
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No excluded words yet.
                </Text>
              ) : (
                excludedWords.map((ew) => (
                  <View key={ew.id} style={[styles.excludeRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.excludeWord, { color: colors.foreground }]}>
                      {ew.word}
                    </Text>
                    <TouchableOpacity
                      onPress={async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        await onDeleteExcludedWord(ew.id);
                      }}
                      style={[styles.iconBtn, { backgroundColor: colors.destructive + "18" }]}
                    >
                      <Feather name="trash-2" size={13} color={colors.destructive} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
              {showAddWord && (
                <AddWordForm
                  onAdd={async (w) => { await onAddExcludedWord(w); setShowAddWord(false); Haptics.selectionAsync(); }}
                  onCancel={() => setShowAddWord(false)}
                  colors={colors}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 28 },
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitles: { flex: 1, gap: 2 },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  sectionSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  listCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingVertical: 20,
  },
  termRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  termDisplay: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  termEnglish: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
  termIndonesian: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
  termActions: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
  termEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  termEditActions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  termInput: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  wordInput: {
    height: 34,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addForm: {
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 8,
  },
  excludeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  excludeWord: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textDecorationLine: "line-through",
  },
  hint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
