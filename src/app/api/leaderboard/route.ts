import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/stores";

export async function GET() {
  try {
    const data = await getLeaderboard();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard." },
      { status: 500 }
    );
  }
}