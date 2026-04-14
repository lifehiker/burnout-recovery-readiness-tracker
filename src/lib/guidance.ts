import type { BurnoutStatus } from "@/types";

const guidanceMessages: Record<BurnoutStatus, string[]> = {
  low: [
    "You look relatively well recovered today. Keep your routine steady.",
    "Solid signals today. Stay consistent and protect your recovery habits.",
    "You're in a good place. Maintain your current balance.",
  ],
  watch: [
    "Your signals are mixed. Consider reducing load and prioritizing sleep.",
    "Some strain showing. Take breaks, ease up on intensity today.",
    "Watch your energy. One lighter day can prevent a harder week.",
  ],
  elevated: [
    "Your recent pattern suggests strain. Scale back where possible and recover.",
    "High stress signals. Prioritize rest, reduce workload if you can.",
    "Recovery needed. Protect your sleep and dial back non-essential demands.",
  ],
};

export function getGuidanceMessage(status: BurnoutStatus, score: number): string {
  const messages = guidanceMessages[status];
  // Use score to deterministically pick a message variant
  const index = score % messages.length;
  return messages[index];
}

export function getStatusLabel(status: BurnoutStatus): string {
  switch (status) {
    case "low":
      return "Low Risk";
    case "watch":
      return "Watch";
    case "elevated":
      return "Elevated Risk";
  }
}

export function getStatusColor(status: BurnoutStatus): string {
  switch (status) {
    case "low":
      return "text-green-600";
    case "watch":
      return "text-yellow-600";
    case "elevated":
      return "text-red-600";
  }
}

export function getStatusBgColor(status: BurnoutStatus): string {
  switch (status) {
    case "low":
      return "bg-green-100 text-green-800";
    case "watch":
      return "bg-yellow-100 text-yellow-800";
    case "elevated":
      return "bg-red-100 text-red-800";
  }
}
