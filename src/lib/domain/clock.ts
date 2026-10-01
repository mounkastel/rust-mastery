/**
 * Calendar-day arithmetic.
 *
 * A scheduling decision in this app is always "how many days from now", never
 * "how many milliseconds from now", and a local day is not 24 hours:
 * `new Date(y, m, d + 1)` resolves against the host timezone, so adding one
 * calendar day across a DST change yields 23 or 25 elapsed hours. Everything
 * that needs a day boundary goes through here.
 */
export function startOfLocalDay(epochMs: number): number {
  const d = new Date(epochMs);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * A stable integer for "which local day is this". Derived from the local
 * midnight, so two instants on the same day always agree and two instants on
 * adjacent days never do, in any timezone.
 */
export function localDayNumber(epochMs: number): number {
  return Math.round(startOfLocalDay(epochMs) / 86_400_000);
}

export function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
