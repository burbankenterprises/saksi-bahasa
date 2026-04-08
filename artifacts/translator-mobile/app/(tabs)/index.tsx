import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { WordFamilySheet } from "@/components/WordFamilySheet";
import { useTranslate, useGetWordFamily } from "@workspace/api-client-react";

interface TranslationStyle {
  indonesian: string;
  literal: string;
}

interface TranslationResult {
  casual: TranslationStyle;
  polite: TranslationStyle;
  formal: TranslationStyle;
}

interface WordFamilyData {
  word: string;
  briefMeaning: string;
  inAction: Array<{ indonesian: string; english: string }>;
  wordFamily: Array<{
    word: string;
    meaning: string;
    exampleIndonesian: string;
    exampleEnglish: string;
  }>;
  whenToUse: Array<{
    word: string;
    label: string;
    whatItMeans: string | null;
    whenToUse: string;
    exampleIndonesian: string;
    exampleEnglish: string;
    isThisWord: boolean;
  }>;
}

const STYLE_CONFIG = [
  {
    key: "casual" as const,
    label: "Casual",
    icon: "message-circle" as const,
    description: "Like talking with friends",
  },
  {
    key: "polite" as const,
    label: "Polite",
    icon: "users" as const,
    description: "Respectful public speech",
  },
  {
    key: "formal" as const,
    label: "JW Meeting",
    icon: "book-open" as const,
    description: "Discourse / meeting style",
  },
];

function ClickableText({
  text,
  onWordPress,
  style,
  testID,
}: {
  text: string;
  onWordPress: (word: string, context: string) => void;
  style?: object;
  testID?: string;
}) {
  const colors = useColors();
  const words = text.split(/(\s+)/);

  return (
    <Text style={style} testID={testID}>
      {words.map((part, i) => {
        if (/^\s+$/.test(part)) {
          return <Text key={i}>{part}</Text>;
        }
        const cleanWord = part.replace(/[.,!?;:'"()]/g, "");
        if (!cleanWord) return <Text key={i}>{part}</Text>;
        return (
          <Text
            key={i}
            onPress={() => onWordPress(cleanWord, text)}
            style={[styles.clickableWord, { color: colors.foreground }]}
            testID={`word-${cleanWord}-${i}`}
          >
            {part}
          </Text>
        );
      })}
    </Text>
  );
}

function TranslationCard({
  styleKey,
  label,
  icon,
  description,
  translation,
  onWordPress,
}: {
  styleKey: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  description: string;
  translation: TranslationStyle;
  onWordPress: (word: string, context: string) => void;
}) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      testID={`card-${styleKey}`}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.cardIconBadge,
            { backgroundColor: colors.primary + "22" },
          ]}
        >
          <Feather name={icon} size={14} color={colors.primary} />
        </View>
        <View style={styles.cardTitleGroup}>
          <Text
            style={[styles.cardTitle, { color: colors.foreground }]}
            testID={`label-${styleKey}`}
          >
            {label}
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>
            {description}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <ClickableText
          text={translation.indonesian}
          onWordPress={onWordPress}
          style={[styles.indonesianText, { color: colors.foreground }]}
          testID={`indonesian-${styleKey}`}
        />

        <View
          style={[
            styles.literalContainer,
            { borderTopColor: colors.border },
          ]}
        >
          <Text
            style={[styles.literalLabel, { color: colors.primary }]}
          >
            Literal Translation
          </Text>
          <Text
            style={[styles.literalText, { color: colors.mutedForeground }]}
            testID={`literal-${styleKey}`}
          >
            {translation.literal}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function TranslateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedContext, setSelectedContext] = useState<string>("");
  const [wordFamilyData, setWordFamilyData] = useState<WordFamilyData | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const translateMutation = useTranslate();
  const wordFamilyMutation = useGetWordFamily();

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const data = await translateMutation.mutateAsync({ data: { text: inputText.trim() } });
      setResult(data as unknown as TranslationResult);
    } catch {
      // error handled by mutation
    }
  }, [inputText, translateMutation]);

  const handleWordPress = useCallback(
    async (word: string, context: string) => {
      Haptics.selectionAsync();
      setSelectedWord(word);
      setSelectedContext(context);
      setWordFamilyData(null);
      setSheetVisible(true);
      try {
        const data = await wordFamilyMutation.mutateAsync({
          data: { word, context },
        });
        setWordFamilyData(data as unknown as WordFamilyData);
      } catch {
        // error handled
      }
    },
    [wordFamilyMutation]
  );

  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.appTitle, { color: colors.foreground }]}>
            Saksi Bahasa
          </Text>
          <Text style={[styles.appSubtitle, { color: colors.mutedForeground }]}>
            Indonesian Translator
          </Text>
        </View>

        <View
          style={[
            styles.inputCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              {
                color: colors.foreground,
                fontFamily: "Inter_400Regular",
              },
            ]}
            placeholder="Type English text to translate..."
            placeholderTextColor={colors.mutedForeground}
            value={inputText}
            onChangeText={setInputText}
            multiline
            textAlignVertical="top"
            testID="input-text"
          />

          <TouchableOpacity
            style={[
              styles.translateButton,
              {
                backgroundColor:
                  !inputText.trim() || translateMutation.isPending
                    ? colors.muted
                    : colors.primary,
              },
            ]}
            onPress={handleTranslate}
            disabled={!inputText.trim() || translateMutation.isPending}
            testID="button-translate"
            activeOpacity={0.8}
          >
            {translateMutation.isPending ? (
              <ActivityIndicator
                size="small"
                color={colors.primaryForeground}
              />
            ) : (
              <>
                <Feather
                  name="globe"
                  size={16}
                  color={
                    !inputText.trim()
                      ? colors.mutedForeground
                      : colors.primaryForeground
                  }
                />
                <Text
                  style={[
                    styles.translateButtonText,
                    {
                      color: !inputText.trim()
                        ? colors.mutedForeground
                        : colors.primaryForeground,
                    },
                  ]}
                >
                  Translate
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {!result && !translateMutation.isPending && (
          <View style={styles.emptyState} testID="empty-state">
            <Feather name="globe" size={40} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>
              Ready to translate
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.mutedForeground }]}
            >
              Tap any Indonesian word in the output{"\n"}to see its word family
            </Text>
          </View>
        )}

        {translateMutation.isPending && (
          <View style={styles.loadingState} testID="loading-state">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
              Translating...
            </Text>
          </View>
        )}

        {translateMutation.isError && (
          <View style={styles.errorState} testID="error-state">
            <Feather name="alert-circle" size={32} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              Translation failed. Please try again.
            </Text>
            <TouchableOpacity
              onPress={handleTranslate}
              style={[
                styles.retryButton,
                { borderColor: colors.destructive },
              ]}
              testID="button-retry"
            >
              <Text style={{ color: colors.destructive, fontFamily: "Inter_500Medium" }}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {result && !translateMutation.isPending && (
          <View style={styles.results} testID="results-container">
            <Text style={[styles.tapHint, { color: colors.mutedForeground }]}>
              Tap any word for details
            </Text>
            {STYLE_CONFIG.map((cfg) => (
              <TranslationCard
                key={cfg.key}
                styleKey={cfg.key}
                label={cfg.label}
                icon={cfg.icon}
                description={cfg.description}
                translation={result[cfg.key]}
                onWordPress={handleWordPress}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <WordFamilySheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        word={selectedWord}
        data={wordFamilyData}
        isLoading={wordFamilyMutation.isPending}
        isError={wordFamilyMutation.isError}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  inputCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  textInput: {
    padding: 16,
    fontSize: 16,
    minHeight: 110,
    lineHeight: 24,
  },
  translateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
  },
  translateButtonText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  errorState: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 32,
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  results: {
    gap: 14,
  },
  tapHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    paddingBottom: 10,
  },
  cardIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleGroup: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  cardSubtitle: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 10,
  },
  indonesianText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 26,
  },
  clickableWord: {
    textDecorationLine: "underline",
    textDecorationStyle: "dotted",
  },
  literalContainer: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 4,
  },
  literalLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  literalText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    fontStyle: "italic",
  },
});
