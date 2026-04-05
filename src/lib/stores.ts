import { connectToDatabase } from './mongo';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export interface CriteriaBreakdown {
  logic: number;
  clarity: number;
  creativity: number;
  persuasiveness: number;
  persona_alignment: number;
}

export interface ArgumentFeedback {
  argument_id: string;
  score: number;
  feedback: string;
}

export interface EvaluationResult {
  total_score: number;
  criteria_breakdown: CriteriaBreakdown;
  argument_wise_feedback: ArgumentFeedback[];
  overall_feedback: string;
}

export interface SubmissionRecord {
  submissionJson: any;
  notebookLink: string;
  timestamp: Date;
  score: number;
  evaluation: EvaluationResult;
}

export interface UserSubmissionStore {
  name: string;
  email: string;
  dailySubmissionCount: number;
  lastSubmissionDate: string; // ISO date string "YYYY-MM-DD"
  bestSubmission: SubmissionRecord | null;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  persona: string;
  topic: string;
  stance: string;
}

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────

const MAX_DAILY_SUBMISSIONS = 3;
const COLLECTION = 'users';

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
}

// ─────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────

export async function createOrUpdateUser(
  name: string,
  email: string
): Promise<void> {
  const { db } = await connectToDatabase();
  const col = db.collection<UserSubmissionStore>(COLLECTION);

  await col.updateOne(
    { email },
    {
      $setOnInsert: {
        name,
        email,
        dailySubmissionCount: 0,
        lastSubmissionDate: getTodayDateString(),
        bestSubmission: null,
      },
    },
    { upsert: true }
  );
}

// ─────────────────────────────────────────
// DAILY LIMIT CHECK
// ─────────────────────────────────────────

export async function checkDailyLimit(
  email: string
): Promise<{ allowed: boolean; remaining: number }> {
  const { db } = await connectToDatabase();
  const col = db.collection<UserSubmissionStore>(COLLECTION);

  const user = await col.findOne({ email });
  const today = getTodayDateString();

  if (!user) {
    return { allowed: true, remaining: MAX_DAILY_SUBMISSIONS };
  }

  // Reset count if date changed
  if (user.lastSubmissionDate !== today) {
    return { allowed: true, remaining: MAX_DAILY_SUBMISSIONS };
  }

  const remaining = MAX_DAILY_SUBMISSIONS - user.dailySubmissionCount;
  return {
    allowed: user.dailySubmissionCount < MAX_DAILY_SUBMISSIONS,
    remaining: Math.max(0, remaining),
  };
}

// ─────────────────────────────────────────
// ADD SUBMISSION
// ─────────────────────────────────────────

export async function addSubmission(
  email: string,
  submissionJson: any,
  notebookLink: string,
  score: number,
  evaluation: EvaluationResult
): Promise<{ success: boolean; isNewBest: boolean }> {
  const { db } = await connectToDatabase();
  const col = db.collection<UserSubmissionStore>(COLLECTION);

  const user = await col.findOne({ email });
  if (!user) return { success: false, isNewBest: false };

  const today = getTodayDateString();
  const isNewDay = user.lastSubmissionDate !== today;
  const newCount = isNewDay ? 1 : user.dailySubmissionCount + 1;

  const isNewBest =
    !user.bestSubmission || score > user.bestSubmission.score;

  const updatePayload: any = {
    $set: {
      dailySubmissionCount: newCount,
      lastSubmissionDate: today,
    },
  };

  if (isNewBest) {
    updatePayload.$set.bestSubmission = {
      submissionJson,
      notebookLink,
      timestamp: new Date(),
      score,
      evaluation,
    };
  }

  await col.updateOne({ email }, updatePayload);

  return { success: true, isNewBest };
}

// ─────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { db } = await connectToDatabase();
  const col = db.collection<UserSubmissionStore>(COLLECTION);

  const results = await col
    .find(
      { bestSubmission: { $ne: null } },
      {
        projection: {
          name: 1,
          'bestSubmission.score': 1,
          'bestSubmission.submissionJson.persona': 1,
          'bestSubmission.submissionJson.topic': 1,
          'bestSubmission.submissionJson.stance': 1,
          _id: 0,
        },
      }
    )
    .sort({ 'bestSubmission.score': -1 })
    .toArray();

  return results.map((r) => ({
    name: r.name,
    score: r.bestSubmission?.score ?? 0,
    persona: r.bestSubmission?.submissionJson?.persona ?? '—',
    topic: r.bestSubmission?.submissionJson?.topic ?? '—',
    stance: r.bestSubmission?.submissionJson?.stance ?? '—',
  }));
}

// ─────────────────────────────────────────
// GET USER
// ─────────────────────────────────────────

export async function getUserSubmission(
  email: string
): Promise<UserSubmissionStore | null> {
  const { db } = await connectToDatabase();
  const col = db.collection<UserSubmissionStore>(COLLECTION);
  return await col.findOne({ email });
}