// Pure date helpers, no DB or framework imports so they're easy to unit test.

const DAY_MS = 24 * 60 * 60 * 1000;

// Returns the next N upcoming dates (as YYYY-MM-DD strings) that fall on the
// given day of week (0=Sunday..6=Saturday), starting from today (inclusive).
export function nextDatesForDayOfWeek(dayOfWeek: number, count: number, from: Date = new Date()): string[] {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const diff = (dayOfWeek - start.getDay() + 7) % 7;
  const first = new Date(start.getTime() + diff * DAY_MS);

  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(first.getTime() + i * 7 * DAY_MS);
    dates.push(toISODate(d));
  }
  return dates;
}

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function formatDateHuman(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatDateTimeHuman(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function formatTime12h(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}
