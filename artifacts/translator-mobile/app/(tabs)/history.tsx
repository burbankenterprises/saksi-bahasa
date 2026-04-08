import React, { useState, useCallback } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useHistory, type HistoryEntry } from "@/hooks/useHistory";

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
  colors,
}: {
  entry: HistoryEntry;
  onToggleSaved: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  colors: ReturnType<typeof useColors>;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: entry.saved ? colors.primary + "0D" : colors.card,
          borderColor: entry.saved ? colors.primary + "50" : colors.border,
        },
      ]}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardMeta}>
          <Text style={[styles.timestamp, { color: colors.mutedForeground }]}>
            {timeAgo(entry.timestamp)}
          </Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: entry.localSlang
                  ? colors.primary + "25"
                  : colors.secondary,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: entry.localSlang ? colors.primary : colors.mutedForeground },
              ]}
            >
              {entry.localSlang
                ? REGION_LABELS[entry.region] ?? entry.region
                : "🌐 Universal"}
            </Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={async () => {
              Haptics.selectionAsync();
              await onToggleSaved(entry.id);
            }}
            style={[styles.iconBtn, { backgroundColor: entry.saved ? colors.primary + "22" : colors.secondary }]}
          >
            <Feather
              name={entry.saved ? "bookmark" : "bookmark"}
              size={14}
              color={entry.saved ? colors.primary : colors.mutedForeground}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await onDelete(entry.id);
            }}
            style={[styles.iconBtn, { backgroundColor: colors.destructive + "18" }]}
          >
            <Feather name="trash-2" size={14} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.inputText, { color: colors.foreground }]} numberOfLines={2}>
        {entry.inputText}
      </Text>
      <Text style={[styles.previewText, { color: colors.mutedForeground }]} numberOfLines={1}>
        {entry.translations.formal.indonesian}
      </Text>

      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        style={[styles.expandBtn, { borderTopColor: colors.border }]}
        activeOpacity={0.7}
      >
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={13}
          color={colors.mutedForeground}
        />
        <Text style={[styles.expandBtnText, { color: colors.mutedForeground }]}>
          {expanded ? "Hide" : "All translations"}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          {(
            [
              { key: "casual" as const, label: "Casual", color: "#16a34a" },
              { key: "polite" as const, label: "Polite", color: "#2563eb" },
              { key: "formal" as const, label: "Formal", color: colors.primary },
            ]
          ).map(({ key, label, color }) => (
            <View key={key} style={[styles.styleBlock, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.styleLabel, { color }]}>{label}</Text>
              <Text style={[styles.styleIndonesian, { color: colors.foreground }]}>
                {entry.translations[key].indonesian}
              </Text>
              <Text style={[styles.styleLiteral, { color: colors.mutedForeground }]}>
                {entry.translations[key].literal}
              </Text>
              {key === "casual" && entry.translations.casual.slangExplanation ? (
                <Text style={[styles.styleExplanation, { color: colors.mutedForeground, borderTopColor: colors.border }]}>
                  {entry.translations.casual.slangExplanation}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries, loaded, toggleSaved, deleteEntry, clearAll, refresh } = useHistory();
  const [filter, setFilter] = useState<"all" | "saved">("all");

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const shown = filter === "saved" ? entries.filter((e) => e.saved) : entries;

  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const handleClearAll = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Clear all history? Saved entries will also be removed.")) {
        clearAll();
      }
    } else {
      Alert.alert(
        "Clear History",
        "Clear all history? Saved entries will also be removed.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear All",
            style: "destructive",
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              clearAll();
            },
          },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.border, paddingTop: topPad + 8 },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>History</Text>
          {entries.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7}>
              <Text style={[styles.clearBtn, { color: colors.destructive }]}>Clear all</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.filterRow}>
          {(["all", "saved"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => {
                Haptics.selectionAsync();
                setFilter(f);
              }}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: filter === f ? colors.primary : colors.secondary,
                  borderColor: filter === f ? colors.primary : colors.border,
                },
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterBtnText,
                  { color: filter === f ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                {f === "saved" ? "⭐ Saved" : `All (${entries.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPad + 24 },
        ]}
      >
        {!loaded ? null : shown.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📖</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {filter === "saved" ? "No saved translations" : "No history yet"}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              {filter === "saved"
                ? "Tap the bookmark on any entry to save it."
                : "Your translations will appear here automatically."}
            </Text>
          </View>
        ) : (
          shown.map((entry) => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              onToggleSaved={toggleSaved}
              onDelete={deleteEntry}
              colors={colors}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: 1, paddingHorizontal: 20, paddingBottom: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  clearBtn: { fontSize: 13, fontFamily: "Inter_500Medium" },
  filterRow: { flexDirection: "row", gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  filterBtnText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  emptyState: { alignItems: "center", paddingTop: 64, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptySubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  card: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 8 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  cardMeta: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  timestamp: { fontSize: 11, fontFamily: "Inter_400Regular" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  cardActions: { flexDirection: "row", gap: 6, marginLeft: 8 },
  iconBtn: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  inputText: { fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  previewText: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  expandBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingTop: 8, marginTop: 2, borderTopWidth: 1 },
  expandBtnText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  expandedContent: { gap: 8 },
  styleBlock: { borderRadius: 10, padding: 10, gap: 4 },
  styleLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8 },
  styleIndonesian: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  styleLiteral: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  styleExplanation: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, paddingTop: 6, marginTop: 4, borderTopWidth: 1 },
});
