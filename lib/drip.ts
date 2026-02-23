/**
 * lib/drip.ts
 *
 * Core drip scheduling logic.
 * Pure functions only — no DB calls, no side effects, fully unit-testable.
 */

export interface ModuleWithSchedule {
  id: string;
  title: string;
  unlockDay: number;  // days after joinedAt when this module becomes accessible
  position: number;
}

export interface ModuleStatus extends ModuleWithSchedule {
  isUnlocked: boolean;
  daysRemaining: number | null; // null when already unlocked
  unlockDate: Date;
}

/**
 * calculateDripStatus
 *
 * Given a member's join date and a list of course modules, returns the
 * lock/unlock status of every module as of `now`.
 *
 * Example:
 *   joinedAt = 2026-02-01, module.unlockDay = 7
 *   → unlockDate = 2026-02-08
 *   → isUnlocked = (today >= 2026-02-08)
 */
export function calculateDripStatus(
  joinedAt: Date,
  modules: ModuleWithSchedule[],
  now: Date = new Date()
): ModuleStatus[] {
  return [...modules]
    .sort((a, b) => a.position - b.position)
    .map((mod) => {
      // Unlock date = midnight on (joinedAt + unlockDay)
      const unlockDate = new Date(joinedAt);
      unlockDate.setDate(unlockDate.getDate() + mod.unlockDay);
      unlockDate.setHours(0, 0, 0, 0);

      const isUnlocked = now >= unlockDate;

      const msRemaining = unlockDate.getTime() - now.getTime();
      const daysRemaining = isUnlocked
        ? null
        : Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

      return {
        ...mod,
        isUnlocked,
        daysRemaining,
        unlockDate,
      };
    });
}

/**
 * getModulesUnlockingOn
 *
 * Returns all modules that unlock on a specific calendar date for a given
 * join date. Used by the daily cron job to find who to notify.
 */
export function getModulesUnlockingOn(
  joinedAt: Date,
  modules: ModuleWithSchedule[],
  targetDate: Date
): ModuleWithSchedule[] {
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  return modules.filter((mod) => {
    const unlockDate = new Date(joinedAt);
    unlockDate.setDate(unlockDate.getDate() + mod.unlockDay);
    unlockDate.setHours(0, 0, 0, 0);
    return unlockDate.getTime() === target.getTime();
  });
}

/**
 * formatDaysRemaining
 *
 * Human-readable countdown label shown on locked modules.
 * "Unlocks in 1 day" / "Unlocks in 3 days" / "Unlocks tomorrow"
 */
export function formatDaysRemaining(days: number): string {
  if (days <= 0) return "Unlocking soon";
  if (days === 1) return "Unlocks tomorrow";
  return `Unlocks in ${days} days`;
}
