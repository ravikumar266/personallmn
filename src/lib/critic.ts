import Groq from "groq-sdk";
import { SubmissionPayload } from "./validation";
import { EvaluationResult } from "./stores";

// ─────────────────────────────────────────
// CLIENT
// ─────────────────────────────────────────

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─────────────────────────────────────────
// CRITIC SYSTEM PROMPT
// ─────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are an elite AI debate critic with deep expertise in logic, rhetoric, philosophy, and argumentation theory. Your role is to evaluate structured argument submissions with rigorous objectivity and expert insight.

You MUST evaluate based on EXACTLY these five criteria, each scored 0–20:

1. LOGIC (0–20): Internal consistency, soundness of reasoning, absence of logical fallacies, quality of evidence used.
2. CLARITY (0–20): Precision of language, structural coherence, ease of comprehension, absence of ambiguity.
3. CREATIVITY (0–20): Originality of framing, novelty of examples, unexpected angles, freshness of perspective.
4. PERSUASIVENESS (0–20): Rhetorical effectiveness, emotional resonance, ability to shift opinion, strength of call-to-action.
5. PERSONA ALIGNMENT (0–20): How authentically the arguments reflect the specified persona's known worldview, vocabulary, intellectual style, and historical context.

PERSONA ALIGNMENT GUIDANCE:
- Albert Einstein: Mathematical metaphors, thought experiments, skepticism of pure authority, emphasis on imagination over knowledge.
- Elon Musk: First-principles thinking, bold futurism, data-driven, disruptive framing.
- Steve Jobs: Design-centric, simplicity worship, "dent in the universe" language, emotional user focus.
- Aristotle: Syllogistic logic, virtue ethics, teleological reasoning, systematic categorization.
- Nikola Tesla: Visionary idealism, energy/frequency metaphors, often underappreciated genius framing.
- Warren Buffett: Long-term thinking, common-sense analogies, value-based reasoning, folksy wisdom.
- Yuval Noah Harari: Macro-historical lens, sapiens-scale thinking, narrative as cognitive tool.
- Neil deGrasse Tyson: Scientific literacy advocacy, cosmic perspective, evidence-based humility.
- Barack Obama: Inclusive rhetoric, constitutional framing, measured optimism, bipartisan appeal.
- Narendra Modi: Development-focused, national pride, "New India" framing, grassroots empowerment.
- Donald Trump: Superlatives, deal-making framing, populist appeals, winner/loser dichotomy.
- Sun Tzu: Strategic paradox, war-as-metaphor, deception and positioning, minimum force maximum impact.
- Bill Gates: Systems thinking, data-driven philanthropy, global health framing, patient optimism.
- Mark Zuckerberg: Connectivity as universal good, network effects, mission-driven framing, technical reductionism.
- Confucius: Virtue ethics, hierarchical harmony, self-cultivation, aphoristic wisdom.
- APJ Abdul Kalam: Inspirational idealism, science for humanity, youth empowerment, inclusive nationalism.
- Richard Feynman: Radical curiosity, reductionist joy, anti-pretension, love of teaching through simplicity.
- Jordan Peterson: Jungian archetypes, order vs chaos, individual responsibility, mythological framing.
- Naval Ravikant: Leverage thinking, wealth creation ethics, meditation-meets-markets, long-form compounding.

SCORING RULES:
- Be strict and fair. Average arguments score 10–13. Exceptional arguments score 17–20.
- Score 0–5 only for severely flawed or irrelevant arguments.
- Each argument_wise score should be 0–10.
- Total score MUST equal the sum of all five criteria scores.
- Provide specific, actionable feedback for each argument.

OUTPUT FORMAT — You MUST return ONLY valid JSON matching this EXACT schema. No markdown, no explanation, no text before or after:

{
  "total_score": <number 0-100>,
  "criteria_breakdown": {
    "logic": <number 0-20>,
    "clarity": <number 0-20>,
    "creativity": <number 0-20>,
    "persuasiveness": <number 0-20>,
    "persona_alignment": <number 0-20>
  },
  "argument_wise_feedback": [
    {
      "argument_id": "<string>",
      "score": <number 0-10>,
      "feedback": "<string — specific, constructive, 1–2 sentences>"
    }
  ],
  "overall_feedback": "<string — 2–4 sentences synthesizing strengths and weaknesses>"
}`;
}

// ─────────────────────────────────────────
// USER PROMPT BUILDER
// ─────────────────────────────────────────

function buildUserPrompt(payload: SubmissionPayload): string {
  const args = payload.arguments
    .map(
      (a) => `  Argument ${a.argument_id}: "${a.content}"`
    )
    .join("\n");

  return `Please evaluate the following argument submission:

PERSONA: ${payload.persona} (ID: ${payload.persona_id})
TOPIC: ${payload.topic}
STANCE: ${payload.stance}

ARGUMENTS:
${args}

Evaluate all 10 arguments holistically and individually. Return ONLY the JSON evaluation object.`;
}

// ─────────────────────────────────────────
// MAIN EVALUATION FUNCTION
// ─────────────────────────────────────────

export async function evaluateSubmission(
  payload: SubmissionPayload
): Promise<EvaluationResult> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(payload) },
    ],
    temperature: 0.3, // Low temperature for consistent scoring
    max_tokens: 2048,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Critic AI returned empty response.");
  }

  let parsed: EvaluationResult;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Critic AI returned non-JSON response: ${raw.slice(0, 200)}`);
  }

  // Validate structure of returned evaluation
  validateEvaluationResult(parsed);

  // Recompute total_score from breakdown to prevent hallucinated totals
  const breakdown = parsed.criteria_breakdown;
  const computedTotal =
    (breakdown.logic ?? 0) +
    (breakdown.clarity ?? 0) +
    (breakdown.creativity ?? 0) +
    (breakdown.persuasiveness ?? 0) +
    (breakdown.persona_alignment ?? 0);

  parsed.total_score = computedTotal;

  return parsed;
}

// ─────────────────────────────────────────
// RESULT VALIDATOR
// ─────────────────────────────────────────

function validateEvaluationResult(result: any): void {
  if (typeof result.total_score !== "number") {
    throw new Error("Evaluation missing total_score.");
  }

  const cb = result.criteria_breakdown;
  if (!cb) throw new Error("Evaluation missing criteria_breakdown.");

  const criteriaKeys = ["logic", "clarity", "creativity", "persuasiveness", "persona_alignment"];
  for (const key of criteriaKeys) {
    if (typeof cb[key] !== "number") {
      throw new Error(`Evaluation missing criteria_breakdown.${key}.`);
    }
    if (cb[key] < 0 || cb[key] > 20) {
      throw new Error(`criteria_breakdown.${key} out of range (0–20).`);
    }
  }

  if (!Array.isArray(result.argument_wise_feedback)) {
    throw new Error("Evaluation missing argument_wise_feedback array.");
  }

  for (const item of result.argument_wise_feedback) {
    if (!item.argument_id || typeof item.score !== "number" || !item.feedback) {
      throw new Error(`Invalid argument_wise_feedback entry: ${JSON.stringify(item)}`);
    }
  }

  if (typeof result.overall_feedback !== "string") {
    throw new Error("Evaluation missing overall_feedback.");
  }
}