export type BurnoutStatus = "low" | "watch" | "elevated";

export interface CheckInEntry {
  id: string;
  userId: string;
  date: string;
  stress: number;
  energy: number;
  sleep: number;
  soreness: number;
  workload: number;
  mood: number;
  note?: string | null;
  readinessScore: number;
  burnoutStatus: BurnoutStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckInFormData {
  stress: number;
  energy: number;
  sleep: number;
  soreness: number;
  workload: number;
  mood: number;
  note?: string;
}

export interface DashboardStats {
  todayEntry: CheckInEntry | null;
  sevenDayAverage: number | null;
  thirtyDayTrend: "up" | "down" | "stable" | null;
  streakCount: number;
  guidance: string;
  burnoutStatus: BurnoutStatus | null;
}
