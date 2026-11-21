import { db } from './db';

const DAILY_BUDGET_USD = parseFloat(process.env.DAILY_BUDGET_USD || '15');

/**
 * Checks if the global daily spending budget has been exceeded.
 * Acts as an automated emergency tripwire to prevent rogue LLM spend.
 */
export function checkBudgetTripwire(): { allowed: boolean; spentUSD: number; limitUSD: number } {
  const spentUSD = db.getDailySpentUSD();
  return {
    allowed: spentUSD < DAILY_BUDGET_USD,
    spentUSD,
    limitUSD: DAILY_BUDGET_USD,
  };
}
