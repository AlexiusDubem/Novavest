import { InvestmentRecord } from "./firebase/types";

/**
 * Calculates current accrued profit for an active investment
 * Uses linear accrual for simulation purposes
 */
export function calculateAccruedProfit(investment: InvestmentRecord): number {
  if (investment.status !== 'active' || !investment.startedAt) return 0;
  
  const now = Date.now();
  const start = investment.startedAt.toDate().getTime();
  const durationMs = investment.termDays * 24 * 60 * 60 * 1000;
  const elapsedMs = now - start;
  
  if (elapsedMs <= 0) return 0;
  
  // Total profit if completed
  const totalProfitRaw = (investment.principal * investment.roiPercent) / 100;
  
  // Linear accrual based on time elapsed
  const progress = Math.min(elapsedMs / durationMs, 1);
  return totalProfitRaw * progress;
}

/**
 * Formats a percentage with precision for live counters
 */
export function formatLiveROI(investment: InvestmentRecord): string {
  if (investment.status !== 'active' || !investment.startedAt) return '0.00000000';
  
  const now = Date.now();
  const start = investment.startedAt.toDate().getTime();
  const durationMs = investment.termDays * 24 * 60 * 60 * 1000;
  const elapsedMs = now - start;
  
  const progress = Math.min(elapsedMs / durationMs, 1);
  const currentROI = investment.roiPercent * progress;
  
  return currentROI.toFixed(8);
}
