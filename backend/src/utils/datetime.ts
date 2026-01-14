import { DateTime } from 'luxon';

export const TIMEZONE = 'Europe/Stockholm';

export function nowInTimezone(): DateTime {
  return DateTime.now().setZone(TIMEZONE);
}

export function parseISOInTimezone(iso: string): DateTime {
  return DateTime.fromISO(iso, { zone: TIMEZONE });
}

export function formatDate(dt: DateTime): string {
  return dt.toFormat('yyyy-MM-dd');
}

export function formatTime(dt: DateTime): string {
  return dt.toFormat('HH:mm');
}
