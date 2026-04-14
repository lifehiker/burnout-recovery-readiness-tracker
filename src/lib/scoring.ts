import type { BurnoutStatus } from "@/types";

export function calculateReadinessScore(
  stress: number,
  energy: number,
  sleep: number,
  soreness: number,
  workload: number,
  mood: number
): number {
  // Positive inputs: energy, sleep, mood (higher = better)
  // Negative inputs: stress, soreness, workload (lower = better, so we invert with 6-x)
  const score =
    ((6 - stress) + energy + sleep + (6 - soreness) + (6 - workload) + mood) /
    30 *
    100;
  return Math.round(Math.min(100, Math.max(0, score)));
}

export function getBurnoutStatus(
  currentScore: number,
  recent7DayAverage: number | null,
  trendDelta: number | null
): BurnoutStatus {
  const avg = recent7DayAverage ?? currentScore;
  const delta = trendDelta ?? 0;

  if (currentScore < 45 || avg < 40) {
    return "elevated";
  }
  if (currentScore >= 70 && delta >= -5) {
    return "low";
  }
  if (currentScore >= 70 && delta < -5) {
    return "watch";
  }
  // 45-69 range
  if (delta < -10) {
    return "elevated";
  }
  return "watch";
}

export function calculateTrendDelta(
  recent: number[],
  older: number[]
): number | null {
  if (recent.length === 0 || older.length === 0) return null;
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  return recentAvg - olderAvg;
}
