import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { TranslateBody, GetWordFamilyBody } from "@workspace/api-zod";

const router = Router();

const SYSTEM_PROMPT = `You are an expert Indonesian language translator and linguist specializing in Jehovah's Witnesses ministry.

Your translations must follow these critical rules:
1. For ALL religious terminology, use the specific Indonesian vocabulary used by Jehovah's Witnesses (jw.org), based on literature published 2010 and newer. For example:
   - "Jehovah's Witness(es)" → "Saksi(-Saksi) Yehuwa"
   - "Jehovah" → "Yehuwa"
   - "Kingdom Hall" → "Balai Kerajaan"
   - "elder" (congregational) → "penatua"
   - "congregation" → "jemaat"
   - "publisher" → "pewarta"
   - "pioneer" → "perintis"
   - "circuit overseer" → "pengawas sirkuit"
   - "Governing Body" → "Badan Pimpinan"
   - "Watchtower" (publication) → "Menara Pengawal"
   - "memorial" (Lord's evening meal) → "Peringatan"
   - Bible study (conducted) → "pelajaran Alkitab"
   - "disciple" → "murid"
   - "preaching/witnessing" → "bersaksi/memberitakan kabar baik"
   - Scripture → "Alkitab" or specific book names in Indonesian
   - "faith" → "iman"
   - "prayer" → "doa"
   - "worship" → "ibadah"

2. Produce three distinct registers:
   a. "casual" — very relaxed, like texting a close friend. Can use informal pronouns (lu/gue instead of kamu/aku), colloquial shortening, or common slang. Natural, warm, flowing.
   b. "polite" — standard respectful Indonesian (Baku) suitable for talking to a stranger or acquaintance in public. Uses "Anda/Bapak/Ibu" where appropriate, proper grammar.
   c. "formal" — elevated formal style suitable for giving a public discourse or comment at a Jehovah's Witnesses meeting. No contractions, complete sentences, proper honorifics.

3. For each translation, also provide a "literal" rendering — a word-for-word or phrase-for-phrase English gloss that shows the Indonesian grammatical structure and word order. This helps English speakers understand Indonesian grammar patterns. Keep it a bit rough/literal to be educational.

Always respond with valid JSON exactly in this structure:
{
  "casual": { "indonesian": "...", "literal": "..." },
  "polite": { "indonesian": "...", "literal": "..." },
  "formal": { "indonesian": "...", "literal": "..." }
}`;

const WORD_FAMILY_SYSTEM_PROMPT = `You are an expert Indonesian language teacher and linguist. When given an Indonesian word, provide a rich, educational explanation of the word family, usage context, and comparisons with related words.

Always respond with valid JSON exactly in this structure:
{
  "word": "the exact word",
  "briefMeaning": "short English meaning, e.g. 'room; space'",
  "inAction": [
    { "indonesian": "sentence 1 in Indonesian", "english": "English translation" },
    { "indonesian": "sentence 2 in Indonesian", "english": "English translation" },
    { "indonesian": "sentence 3 in Indonesian", "english": "English translation" }
  ],
  "wordFamily": [
    { "word": "root or derived form", "meaning": "short meaning", "exampleIndonesian": "sentence", "exampleEnglish": "translation" },
    { "word": "another form", "meaning": "short meaning", "exampleIndonesian": "sentence", "exampleEnglish": "translation" }
  ],
  "whenToUse": [
    {
      "word": "this exact word",
      "label": "THIS WORD",
      "whatItMeans": "plain English explanation of what it means",
      "whenToUse": "when/how to use it",
      "exampleIndonesian": "example sentence",
      "exampleEnglish": "translation",
      "isThisWord": true
    },
    {
      "word": "similar word 1",
      "label": "KEY DIFFERENCE",
      "whatItMeans": null,
      "whenToUse": "how it differs and when to use this one instead",
      "exampleIndonesian": "example sentence",
      "exampleEnglish": "translation",
      "isThisWord": false
    },
    {
      "word": "similar word 2",
      "label": "KEY DIFFERENCE",
      "whatItMeans": null,
      "whenToUse": "how it differs and when to use this one instead",
      "exampleIndonesian": "example sentence",
      "exampleEnglish": "translation",
      "isThisWord": false
    }
  ]
}

Include 2-4 related word forms in wordFamily and 1-3 comparison words in whenToUse. Make the explanations educational and practical.`;

router.post("/translate", async (req, res) => {
  const parseResult = TranslateBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { text } = parseResult.data;

  if (!text || text.trim().length === 0) {
    res.status(400).json({ error: "Text is required" });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Translate this English text to Indonesian in three styles:\n\n${text}` },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      res.status(500).json({ error: "No response from translation service" });
      return;
    }

    const result = JSON.parse(content);
    res.json(result);
  } catch (error) {
    req.log.error({ error }, "Translation error");
    res.status(500).json({ error: "Translation service error" });
  }
});

router.post("/word-family", async (req, res) => {
  const parseResult = GetWordFamilyBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { word, context } = parseResult.data;

  if (!word || word.trim().length === 0) {
    res.status(400).json({ error: "Word is required" });
    return;
  }

  const userMessage = context
    ? `Explain the Indonesian word "${word}" in the context of this sentence: "${context}"`
    : `Explain the Indonesian word "${word}"`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        { role: "system", content: WORD_FAMILY_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      res.status(500).json({ error: "No response from word family service" });
      return;
    }

    const result = JSON.parse(content);
    res.json(result);
  } catch (error) {
    req.log.error({ error }, "Word family error");
    res.status(500).json({ error: "Word family service error" });
  }
});

export default router;
