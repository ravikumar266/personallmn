// ─────────────────────────────────────────
// CONSTANTS — Single source of truth
// ─────────────────────────────────────────

export const VALID_PERSONAS: Record<string, string> = {
  "1": "Albert Einstein",
  "2": "Elon Musk",
  "3": "Steve Jobs",
  "4": "Aristotle",
  "5": "Nikola Tesla",
  "6": "Warren Buffett",
  "7": "Yuval Noah Harari",
  "8": "Neil deGrasse Tyson",
  "9": "Barack Obama",
  "10": "Narendra Modi",
  "11": "Donald Trump",
  "12": "Sun Tzu",
  "13": "Bill Gates",
  "14": "Mark Zuckerberg",
  "15": "Confucius",
  "16": "APJ Abdul Kalam",
  "17": "Richard Feynman",
  "18": "Jordan Peterson",
  "19": "Naval Ravikant",
};

export const VALID_TOPICS: string[] = [
  "Should AI replace human decision-making in critical areas like healthcare and law?",
  "Should governments strictly regulate artificial intelligence?",
  "Will AI create more jobs than it destroys?",
  "Should social media platforms be held legally responsible for user content?",
  "Is remote work more productive than office work?",
  "Should traditional education be replaced by AI-based learning systems?",
  "Is privacy more important than national security in the digital age?",
  "Should big tech companies be broken up to prevent monopolies?",
  "Is cryptocurrency the future of global finance?",
  "Should autonomous vehicles completely replace human drivers?",
];

export const VALID_STANCES = ["FOR", "AGAINST"] as const;
export type Stance = typeof VALID_STANCES[number];

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export interface ArgumentEntry {
  argument_id: string;
  content: string;
}

export interface SubmissionPayload {
  persona: string;
  persona_id: string;
  topic: string;
  stance: Stance;
  arguments: ArgumentEntry[];
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ─────────────────────────────────────────
// VALIDATOR
// ─────────────────────────────────────────

export function validateSubmissionPayload(
  data: any
): ValidationResult {
  // Top-level field presence
  const requiredFields = ["persona", "persona_id", "topic", "stance", "arguments"];
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      return { valid: false, error: `Missing required field: "${field}"` };
    }
  }

  // Persona ID validity
  const personaById = VALID_PERSONAS[data.persona_id];
  if (!personaById) {
    return {
      valid: false,
      error: `Invalid persona_id "${data.persona_id}". Must be one of: ${Object.keys(VALID_PERSONAS).join(", ")}`,
    };
  }

  // Persona name must match ID
  if (personaById !== data.persona) {
    return {
      valid: false,
      error: `Persona name "${data.persona}" does not match persona_id "${data.persona_id}" (expected "${personaById}")`,
    };
  }

  // Topic validity
  if (!VALID_TOPICS.includes(data.topic)) {
    return {
      valid: false,
      error: `Invalid topic. Must exactly match one of the provided topics.`,
    };
  }

  // Stance validity
  if (!VALID_STANCES.includes(data.stance)) {
    return {
      valid: false,
      error: `Invalid stance "${data.stance}". Must be "FOR" or "AGAINST".`,
    };
  }

  // Arguments must be array
  if (!Array.isArray(data.arguments)) {
    return { valid: false, error: `"arguments" must be an array.` };
  }

  // Exactly 10 arguments
  if (data.arguments.length !== 10) {
    return {
      valid: false,
      error: `Exactly 10 arguments required. Got ${data.arguments.length}.`,
    };
  }

  // Each argument structure
  for (let i = 0; i < data.arguments.length; i++) {
    const arg = data.arguments[i];
    if (!arg.argument_id || typeof arg.argument_id !== "string") {
      return {
        valid: false,
        error: `Argument at index ${i} missing or invalid "argument_id".`,
      };
    }
    if (!arg.content || typeof arg.content !== "string" || arg.content.trim().length === 0) {
      return {
        valid: false,
        error: `Argument "${arg.argument_id}" has empty or missing "content".`,
      };
    }
    if (arg.content.trim().length < 20) {
      return {
        valid: false,
        error: `Argument "${arg.argument_id}" content is too short (minimum 20 characters).`,
      };
    }
  }

  // Duplicate argument_id check
  const ids = data.arguments.map((a: ArgumentEntry) => a.argument_id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    return { valid: false, error: `Duplicate argument_ids found.` };
  }

  return { valid: true };
}

// ─────────────────────────────────────────
// CONTENT MODERATION (basic)
// ─────────────────────────────────────────

const BLOCKED_PATTERNS = [
  /\b(kill|murder|rape|torture|genocide|terrorist)\b/i,
  /\b(nigger|faggot|kike|spic|chink)\b/i,
];

export function moderateContent(payload: SubmissionPayload): ValidationResult {
  for (const arg of payload.arguments) {
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(arg.content)) {
        return {
          valid: false,
          error: `Argument "${arg.argument_id}" contains prohibited content and cannot be processed.`,
        };
      }
    }
  }
  return { valid: true };
}