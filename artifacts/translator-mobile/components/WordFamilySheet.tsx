import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface WordRelated {
  word: string;
  meaning: string;
  exampleIndonesian: string;
  exampleEnglish: string;
}

interface WordUsageComparison {
  word: string;
  label: string;
  whatItMeans: string | null;
  whenToUse: string;
  exampleIndonesian: string;
  exampleEnglish: string;
  isThisWord: boolean;
}

interface WordFamilyData {
  word: string;
  briefMeaning: string;
  inAction: Array<{ indonesian: string; english: string }>;
  wordFamily: Array<WordRelated>;
  whenToUse: Array<WordUsageComparison>;
}

interface WordFamilySheetProps {
  visible: boolean;
  onClose: () => void;
  word: string | null;
  data: WordFamilyData | null;
  isLoading: boolean;
  isError: boolean;
}

export function WordFamilySheet({
  visible,
  onClose,
  word,
  data,
  isLoading,
  isError,
}: WordFamilySheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomPad = isWeb ? 34 : insets.bottom;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      testID="word-family-sheet"
    >
      <View style={[styles.sheet, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.sheetHeader,
            { borderBottomColor: colors.border },
          ]}
        >
          <View style={styles.sheetTitleRow}>
            <View
              style={[
                styles.wordPill,
                { backgroundColor: colors.primary + "22" },
              ]}
            >
              <Text
                style={[styles.wordPillText, { color: colors.primary }]}
                testID="sheet-word"
              >
                {word}
              </Text>
            </View>
            {data && (
              <Text
                style={[
                  styles.briefMeaning,
                  { color: colors.mutedForeground },
                ]}
                testID="sheet-meaning"
              >
                {data.briefMeaning}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.closeButton,
              { backgroundColor: colors.secondary },
            ]}
            testID="button-close-sheet"
          >
            <Feather name="x" size={16} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
              Looking up word family...
            </Text>
          </View>
        )}

        {isError && !isLoading && (
          <View style={styles.loadingCenter}>
            <Feather name="alert-circle" size={32} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              Could not load word details
            </Text>
          </View>
        )}

        {data && !isLoading && (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: bottomPad + 32 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <Section
              icon="zap"
              title={`"${data.word}" in action`}
              colors={colors}
            >
              {data.inAction.map((item, i) => (
                <View
                  key={i}
                  style={[
                    styles.inActionItem,
                    { borderColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.inActionNumber,
                      { backgroundColor: colors.primary + "22" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.inActionNumberText,
                        { color: colors.primary },
                      ]}
                    >
                      {i + 1}
                    </Text>
                  </View>
                  <View style={styles.inActionTextGroup}>
                    <Text
                      style={[
                        styles.inActionIndonesian,
                        { color: colors.foreground },
                      ]}
                    >
                      {item.indonesian}
                    </Text>
                    <Text
                      style={[
                        styles.inActionEnglish,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {item.english}
                    </Text>
                  </View>
                </View>
              ))}
            </Section>

            <Section
              icon="git-branch"
              title="Word family in action"
              subtitle="One sentence per word — see how the root connects"
              colors={colors}
            >
              {data.wordFamily.map((item, i) => (
                <View
                  key={i}
                  style={[
                    styles.familyItem,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.familyItemHeader}>
                    <Text
                      style={[
                        styles.familyWord,
                        { color: colors.primary },
                      ]}
                    >
                      {item.word}
                    </Text>
                    <Text
                      style={[
                        styles.familyMeaning,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {item.meaning}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.familyIndonesian,
                      { color: colors.foreground },
                    ]}
                  >
                    {item.exampleIndonesian}
                  </Text>
                  <Text
                    style={[
                      styles.familyEnglish,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {item.exampleEnglish}
                  </Text>
                </View>
              ))}
            </Section>

            <Section
              icon="book-open"
              title={`When to use "${data.word}"`}
              colors={colors}
            >
              {data.whenToUse.map((item, i) => (
                <View
                  key={i}
                  style={[
                    styles.whenItem,
                    {
                      backgroundColor: item.isThisWord
                        ? colors.primary + "11"
                        : colors.card,
                      borderColor: item.isThisWord
                        ? colors.primary + "44"
                        : colors.border,
                    },
                  ]}
                >
                  <View style={styles.whenItemHeader}>
                    <Text
                      style={[
                        styles.whenWord,
                        {
                          color: item.isThisWord
                            ? colors.primary
                            : colors.foreground,
                        },
                      ]}
                    >
                      {item.word}
                    </Text>
                    {item.isThisWord && (
                      <View
                        style={[
                          styles.thisWordBadge,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Text
                          style={[
                            styles.thisWordBadgeText,
                            { color: colors.primaryForeground },
                          ]}
                        >
                          THIS WORD
                        </Text>
                      </View>
                    )}
                  </View>

                  {item.whatItMeans && (
                    <View
                      style={[
                        styles.whatItMeansBox,
                        { backgroundColor: colors.background },
                      ]}
                    >
                      <Text
                        style={[
                          styles.whatItMeansLabel,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        WHAT IT MEANS
                      </Text>
                      <Text
                        style={[
                          styles.whatItMeansText,
                          { color: colors.foreground },
                        ]}
                      >
                        {item.whatItMeans}
                      </Text>
                    </View>
                  )}

                  {!item.isThisWord && (
                    <Text
                      style={[
                        styles.keyDifferenceLabel,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      KEY DIFFERENCE
                    </Text>
                  )}

                  <View style={styles.whenToUseRow}>
                    <Feather
                      name="check-circle"
                      size={14}
                      color={colors.primary}
                    />
                    <Text
                      style={[
                        styles.whenToUseText,
                        { color: colors.foreground },
                      ]}
                    >
                      {item.whenToUse}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.exampleBox,
                      {
                        backgroundColor: item.isThisWord
                          ? colors.background
                          : colors.secondary,
                        borderRadius: 8,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.exampleIndonesian,
                        { color: colors.foreground },
                      ]}
                    >
                      {item.exampleIndonesian}
                    </Text>
                    <Text
                      style={[
                        styles.exampleEnglish,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {item.exampleEnglish}
                    </Text>
                  </View>
                </View>
              ))}
            </Section>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

function Section({
  icon,
  title,
  subtitle,
  colors,
  children,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  colors: ReturnType<typeof useColors>;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Feather name={icon} size={15} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {title}
        </Text>
      </View>
      {subtitle && (
        <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
          {subtitle}
        </Text>
      )}
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  sheetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  wordPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  wordPillText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  briefMeaning: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: -8,
  },
  sectionContent: {
    gap: 10,
  },
  inActionItem: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  inActionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  inActionNumberText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  inActionTextGroup: {
    flex: 1,
    gap: 4,
  },
  inActionIndonesian: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 21,
  },
  inActionEnglish: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
  familyItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  familyItemHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  familyWord: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  familyMeaning: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  familyIndonesian: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 21,
  },
  familyEnglish: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
  whenItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  whenItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  whenWord: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  thisWordBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  thisWordBadgeText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  whatItMeansBox: {
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  whatItMeansLabel: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  whatItMeansText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  keyDifferenceLabel: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  whenToUseRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  whenToUseText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 20,
  },
  exampleBox: {
    padding: 10,
    gap: 4,
    borderRadius: 8,
  },
  exampleIndonesian: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 21,
  },
  exampleEnglish: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
});
