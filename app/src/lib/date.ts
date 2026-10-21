/** Date helpers. Everything user-facing is a local-time ISO date string, YYYY-MM-DD. */

export const isoDate = (d: Date = new Date()): string => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export const today = (): string => isoDate()

export const parseDate = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (iso: string, n: number): string => {
  const d = parseDate(iso)
  d.setDate(d.getDate() + n)
  return isoDate(d)
}

export const daysBetween = (from: string, to: string): number =>
  Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86_400_000)

/** 0 = Sunday, matching Settings.weeklyCapacity indices. */
export const weekdayIndex = (iso: string): number => parseDate(iso).getDay()

/** Monday of the week containing `iso`. */
export const startOfWeek = (iso: string): string => {
  const day = weekdayIndex(iso)
  return addDays(iso, day === 0 ? -6 : 1 - day)
}

const LONG_DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
const SHORT_DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const WEEKDAY = new Intl.DateTimeFormat('en-GB', { weekday: 'short' })

export const formatLong = (iso: string): string => LONG_DATE.format(parseDate(iso))
export const formatShort = (iso: string): string => SHORT_DATE.format(parseDate(iso))
export const formatWeekday = (iso: string): string => WEEKDAY.format(parseDate(iso))

export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`
}

/** "2h 15m" / "45m" — for durations described rather than counted down. */
export const formatMinutes = (mins: number): string => {
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export const relativeDay = (iso: string): string => {
  const diff = daysBetween(today(), iso)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff < 0) return `${-diff} days ago`
  if (diff < 7) return formatWeekday(iso)
  return formatShort(iso)
}
