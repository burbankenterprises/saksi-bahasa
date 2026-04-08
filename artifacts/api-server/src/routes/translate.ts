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
   a. "casual" — very relaxed, like texting a close friend. The specific regional slang/dialect will be specified in the user message. Use that dialect's authentic slang, pronouns, and colloquialisms naturally. If no region is specified, default to Jakarta/Betawi (lu/gue, gw).
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

  const { text, region, jwTerms, excludedWords } = parseResult.data;

  const REGION_DESCRIPTIONS: Record<string, string> = {
    jakarta: "Jakarta/Betawi dialect — use lu/gue/gw pronouns, common Betawi slang (e.g. kagak, nih, deh, dong, loh, emang, nyokap, bokap, gitu), casual big-city feel",
    java: "Central/East Javanese dialect — blend standard Indonesian with Javanese flavour: use 'opo' (what), 'yo/lah' (yeah/right), 'mas' (bro), 'mbak' (sis), 'ra' (tidak), 'dab' (buddy from Jogja), 'mantap', 'gayeng', natural Javanese cadence",
    sunda: "Sundanese/West Java dialect — blend Indonesian with Sundanese flavour: 'maneh' (you, informal), 'abdi' (I, humble), 'atuh' (particle), 'mah' (emphasis), 'euy' (particle), 'kumaha' (how), 'nuhun' (thanks) where natural",
    minang: "Minang/West Sumatera dialect — blend Indonesian with Minang flavour: 'ambo' (I), 'den' (I/me), 'waang/ang' (you), 'awak' (us/self), 'iyo' (yes), 'ndak' (no), warm Minang hospitality tone",
    batak: "Batak/North Sumatera dialect — blend Indonesian with Batak directness and expressions: 'horas' (greetings), 'ito' (sibling/friend), 'Abang/Kakak' for address, strong emphatic Batak speech style, 'pokoknya' frequently, direct and assertive tone",
    bali: "Balinese dialect — blend Indonesian with Balinese flavour: 'tiang' (I, humble), 'jerone/ragane' (you, polite), 'suksma' (thank you), 'nggih' (yes), soft Balinese politeness, spiritual warmth",
    makassar: "Makassar/South Sulawesi dialect — blend Indonesian with Makassar/Bugis flavour: 'ko' (you), 'ki' (polite suffix), 'pale' (then/so), 'ji' (just/only), 'mi' (already/particle), 'na' (it/him/her prefix), bold and proud Bugis-Makassar expression style",
    manado: "Manado/North Sulawesi dialect — blend Indonesian with Manado Malay: 'su' (sudah/already), 'mo' (mau/want), 'jo' (saja/just), 'kong' (then/so), 'mar' (tapi/but), 'ngana' (kamu/you), 'kita' as first person singular, upbeat Manado energy",
  };

  const regionDesc = REGION_DESCRIPTIONS[region ?? "jakarta"];

  if (!text || text.trim().length === 0) {
    res.status(400).json({ error: "Text is required" });
    return;
  }

  let customRules = "";
  if (jwTerms && jwTerms.length > 0) {
    const termLines = jwTerms
      .map((t) => `- "${t.english}" → "${t.indonesian}" (NEVER use any other Indonesian word for this English term)`)
      .join("\n");
    customRules += `\n\nSTRICT USER-DEFINED TERMINOLOGY OVERRIDES — follow exactly, no exceptions:\n${termLines}`;
  }
  if (excludedWords && excludedWords.length > 0) {
    const excludeLines = excludedWords.map((w) => `- "${w}"`).join("\n");
    customRules += `\n\nPROHIBITED WORDS — NEVER use these words in any output under any circumstances:\n${excludeLines}`;
  }

  const systemContent = customRules
    ? `${SYSTEM_PROMPT}\n\n---\nSESSION-SPECIFIC OVERRIDES (take highest priority over all other rules):${customRules}`
    : SYSTEM_PROMPT;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemContent },
        {
          role: "user",
          content: `Translate this English text to Indonesian in three styles.\n\nFor the CASUAL style specifically, use the following regional dialect: ${regionDesc}.\n\nEnglish text:\n${text}`,
        },
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
