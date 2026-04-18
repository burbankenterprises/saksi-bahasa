import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
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

4. For the casual translation ONLY, also write a "slangExplanation" — a concise 2–4 sentence paragraph in English that:
   - Names the specific slang words or particles used and explains why each was chosen for this sentence
   - Gives a brief note on the linguistic origin or cultural influence of those terms (e.g. Betawi Malay, Dutch borrowing, Javanese substrate, youth internet culture, etc.)
   - Describes how mainstream or popular those terms are today among Indonesian speakers and across generations (e.g. widely used by Gen Z and Millennials nationwide, more regional, fading from use, etc.)

5. SLANG VERIFICATION — Every slang word or colloquial expression you use must meet ALL of the following criteria before you may use it:
   a. It is documented in KBBI (Kamus Besar Bahasa Indonesia) OR in credible academic/linguistic references on Indonesian, OR it has overwhelmingly widespread, undisputed everyday use across a broad Indonesian-speaking population.
   b. You are fully confident it is not offensive, derogatory, or double-meaning in any Indonesian dialect or community.
   c. It is the natural, obvious choice — not something you are reaching for simply to make the output feel more casual or slangy.

   CRITICAL — DO NOT FORCE SLANG: The casual register does NOT require slang in every sentence. If no slang term meets the above criteria for a given word or phrase, you MUST use clean, natural, everyday Indonesian instead. Never substitute a questionable or uncertain term just to fulfil a perceived obligation to include slang. A casual sentence written in clear, relaxed standard Indonesian is always better than a casual sentence with unverified, risky, or marginal slang. When in doubt, leave slang out entirely.

6. ABSOLUTE CONTENT SAFETY — This tool is used in a Jehovah's Witnesses ministry context and may be seen by people of all ages. ALL output across ALL three styles must be completely clean, respectful, and family-appropriate at all times. The following are strictly prohibited in any part of the output, including the slangExplanation:
   - Profanity, swear words, or crude language of any kind (in Indonesian, English, or any other language)
   - Vulgar, sexually suggestive, or explicit content
   - Derogatory, insulting, or discriminatory language targeting any person, group, ethnicity, religion, or gender
   - Slurs, offensive slang, or language that demeans or shames anyone
   - Any content inappropriate for children or that would embarrass a Jehovah's Witness in ministry
   If the English input itself contains profanity or inappropriate content, translate the underlying MEANING using clean, respectful language — never mirror offensive vocabulary into the output.

   SPECIAL INSTRUCTION FOR SENSITIVE CONCEPTS — When the English input includes playful, humorous, or colloquial words for concepts like "crazy," "stupid," "idiot," "dumb," "mad," "nuts," "loony," or similar words that describe behaviour or mental state in a lighthearted way, you MUST:
   - Choose ONLY the most neutral, widely-accepted, clean Indonesian equivalent (e.g. "gila" used in a playful, everyday sense, "aneh," "lucu," "konyol," "nyentrik")
   - NEVER use any Indonesian word that is a genuine insult, slur, or clinical term used derogatorily — even if that word exists in everyday speech
   - NEVER translate "crazy/jokey" intent with a word that would cause offence, shame, or hurt if heard by a person with a mental illness or disability
   - When in doubt, choose the milder, safer option every single time
   This rule overrides any perceived stylistic authenticity in the casual register.

Always respond with valid JSON exactly in this structure:
{
  "casual": { "indonesian": "...", "literal": "...", "slangExplanation": "..." },
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

Include 2-4 related word forms in wordFamily and 1-3 comparison words in whenToUse. Make the explanations educational and practical.

CONTENT SAFETY — This tool is used in a Jehovah's Witnesses ministry context and may be seen by all ages. All output must be completely clean, family-appropriate, and respectful at all times. Never include profanity, vulgarity, sexually suggestive content, slurs, or derogatory language in any field. All example sentences must reflect wholesome, everyday situations. If the requested word is itself offensive or vulgar, provide only a brief neutral linguistic description and do not generate example sentences that showcase or normalise the offensive usage.

SLANG IN EXAMPLES — When writing example sentences, only use slang or colloquial terms that are fully verified (KBBI-documented or overwhelmingly widespread undisputed usage), inoffensive in all Indonesian dialects, and the natural obvious choice. Do NOT force slang into example sentences to make them feel more casual. Clear, natural everyday Indonesian is always preferred over uncertain or marginal slang.`;

router.post("/translate", async (req, res) => {
  const parseResult = TranslateBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { text, region, localSlang, jwTerms, excludedWords } = parseResult.data;

  const UNIVERSAL_SLANG_DESC =
    "Universal Indonesian — use casual Indonesian that is understood nationwide. Draw from Jakarta-influenced youth and internet slang that has gone mainstream across all regions: gue/lu/gw (I/you), dong (softener/emphasis), nih (here/see?), sih (softener), banget (very/so much), baper (overly emotional), mager (too lazy to move), gabut (bored/idle), kuy (let's go), mantap (awesome), gitu (like that), emang (indeed/really), nggak/gak (no/not). Sentence structure should feel natural and relaxed but fully comprehensible to any Indonesian speaker regardless of region. A single well-known regional term is acceptable only if it has gone mainstream nationally — avoid heavy regional dialect markers or grammar that would confuse someone from a different island.";

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

  const regionDesc = localSlang
    ? REGION_DESCRIPTIONS[region ?? "jakarta"]
    : UNIVERSAL_SLANG_DESC;

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
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: systemContent,
      messages: [
        {
          role: "user",
          content: `Translate this English text to Indonesian in three styles.\n\nFor the CASUAL style specifically, use the following regional dialect: ${regionDesc}.\n\nEnglish text:\n${text}`,
        },
      ],
    });

    const block = message.content[0];
    const content = block.type === "text" ? block.text : null;
    if (!content) {
      res.status(500).json({ error: "No response from translation service" });
      return;
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
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
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: WORD_FAMILY_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const block = message.content[0];
    const content = block.type === "text" ? block.text : null;
    if (!content) {
      res.status(500).json({ error: "No response from word family service" });
      return;
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    res.json(result);
  } catch (error) {
    req.log.error({ error }, "Word family error");
    res.status(500).json({ error: "Word family service error" });
  }
});

export default router;
