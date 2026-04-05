import { NextRequest, NextResponse } from "next/server";
import {
  createOrUpdateUser,
  addSubmission,
  checkDailyLimit,
} from "@/lib/stores";
import {
  validateSubmissionPayload,
  moderateContent,
  SubmissionPayload,
} from "@/lib/validation";
import { evaluateSubmission } from "@/lib/critic";

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// ─────────────────────────────────────────
// POST /api/submission
// ─────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // ── 1. Parse multipart form ──────────────
    const formData = await request.formData();
    const name = formData.get("name") as string | null;
    const email = formData.get("email") as string | null;
    const notebookUrl = formData.get("notebookUrl") as string | null;
    const submissionFile = formData.get("submission") as File | null;

    // ── 2. Basic field validation ────────────
    if (!name || name.trim().length === 0) {
      return errorResponse("Name is required.", 400);
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse("A valid email address is required.", 400);
    }
    if (
      !notebookUrl ||
      !notebookUrl.startsWith("https://www.kaggle.com/")
    ) {
      return errorResponse(
        "A valid Kaggle notebook URL (https://www.kaggle.com/...) is required.",
        400
      );
    }
    if (!submissionFile) {
      return errorResponse("Submission JSON file is required.", 400);
    }
    if (!submissionFile.name.endsWith(".json")) {
      return errorResponse("Submission file must be a .json file.", 400);
    }

    // ── 3. Parse JSON file ───────────────────
    let submissionPayload: SubmissionPayload;
    try {
      const text = await submissionFile.text();
      submissionPayload = JSON.parse(text);
    } catch {
      return errorResponse(
        "Submission file is not valid JSON. Please check formatting.",
        400
      );
    }

    // ── 4. Structural validation ─────────────
    const structureCheck = validateSubmissionPayload(submissionPayload);
    if (!structureCheck.valid) {
      return errorResponse(structureCheck.error!, 400);
    }

    // ── 5. Content moderation ────────────────
    const moderationCheck = moderateContent(submissionPayload);
    if (!moderationCheck.valid) {
      return errorResponse(moderationCheck.error!, 400);
    }

    // ── 6. Create/update user in DB ──────────
    await createOrUpdateUser(name.trim(), email.toLowerCase().trim());

    // ── 7. Daily limit check ─────────────────
    const limitCheck = await checkDailyLimit(email.toLowerCase().trim());
    if (!limitCheck.allowed) {
      return errorResponse(
        `Daily submission limit reached (max 3 per day). You have ${limitCheck.remaining} submissions remaining today.`,
        429
      );
    }

    // ── 8. Evaluate with Critic AI ───────────
    let evaluation;
    try {
      evaluation = await evaluateSubmission(submissionPayload);
    } catch (err: any) {
      console.error("Critic AI error:", err);
      return errorResponse(
        "Evaluation service encountered an error. Please try again.",
        503
      );
    }

    // ── 9. Store result ──────────────────────
    const { success, isNewBest } = await addSubmission(
      email.toLowerCase().trim(),
      submissionPayload,
      notebookUrl,
      evaluation.total_score,
      evaluation
    );

    if (!success) {
      return errorResponse("Failed to save submission. Please try again.", 500);
    }

    // ── 10. Return result ────────────────────
    return NextResponse.json(
      {
        message: isNewBest
          ? "Submission evaluated! This is your new best score."
          : "Submission evaluated, but did not beat your previous best.",
        score: evaluation.total_score,
        isNewBest,
        remaining_submissions: limitCheck.remaining - 1,
        evaluation,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Submission route error:", error);
    return errorResponse("Internal server error. Please try again.", 500);
  }
}