import type { IssuedAlert } from '@/types/alert';
import type { DateTime } from 'luxon';
import type { SevereThunderstormLevel } from '../warnings-and-watches-indicators/severe-thunderstorm';

export function formatAreasList(areas: string[]): string {
  const filtered = areas.filter(Boolean).map((area) => {
    if (/^From/i.test(area)) {
      area = `areas ${area.replace(/^From\s+/, 'from')}`;
    }
    return area.trim();
  });
  if (filtered.length === 0) return '';
  if (filtered.length === 1) return filtered[0];

  const last = filtered[filtered.length - 1];
  let beforeLast = filtered.slice(0, -1).join(', ');

  // If the last area already contains 'and', just use comma
  if (last.toLowerCase().startsWith('and')) {
    return `${beforeLast}, ${last}`;
  }

  // Otherwise, add 'and' before the last area
  return `${beforeLast} and ${last}`;
}

export function groupAlerts(alerts: IssuedAlert[]): IssuedAlert[][] {
  const grouped: IssuedAlert[][] = [];

  for (const alert of alerts) {
    const lastGroup = grouped[grouped.length - 1];
    if (grouped.length > 0 && lastGroup[0].headline === alert.headline) {
      lastGroup.push(alert);
    } else {
      grouped.push([alert]);
    }
  }

  return grouped;
}

export function formatAlertDuration(from?: DateTime, to?: DateTime): string {
  let duration = '';
  const isSameDay = from && to && to.hasSame(from, 'day');

  if (from) {
    if (isSameDay) {
      duration += `, from ${from.toFormat('HHmm')}hrs`;
    } else {
      duration += `, from ${from.toFormat('HHmm')}hrs on ${from.toFormat('cccc')}`;
    }
  }

  if (to) {
    if (isSameDay) {
      duration += ` until ${to.toFormat('HHmm')}hrs today`;
    } else {
      duration += ` until ${to.toFormat('HHmm')}hrs on ${to.toFormat('cccc')}`;
    }
  }

  return duration;
}

export const COLOR_CODE_MAP: { [key: string]: SevereThunderstormLevel } = {
  yellow: 'watch',
  orange: 'warning',
  red: 'red warning',
};

const getProgressDesc = (openAICalls: number) => [
  'Get reference data (1/2)...',
  'Get reference data (2/2)...',
  ...Array.from(
    { length: openAICalls },
    (_, i) => `Generating summary (${i + 1}/${openAICalls})...`,
  ),
];

export function getProgressUpdater(openAICalls: number) {
  let index = 0;
  const descs = getProgressDesc(openAICalls);
  return () => {
    if (index < descs.length) {
      return {
        desc: descs[index++],
        value: (index / descs.length) * 100,
      };
    }
  };
}

export function getThunderstormOutlookDate(header: string): string {
  // => e.g. 26 Jan 2026
  // const header = thunderstormOutlookItem.header; // e.g., "Valid from midnight Sun, 25 Jan to noon Mon, 26 Jan"
  const dateRegex =
    /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/gi;
  const matches = header.match(dateRegex);
  if (matches && matches.length > 0) {
    return matches[matches.length - 1]; // Return the last matched date
  } else {
    console.error('No date found in thunderstorm outlook header:', header);
    return '';
  }
}

// add and to last item in when array
export function formatDuration(when: string[]): string {
  if (when.length === 0) return '';
  if (when.length === 1) return when[0];
  const last = when[when.length - 1];
  const beforeLast = when.slice(0, -1).join(', ');
  return `${beforeLast} and ${last}`;
}

// return the latest date, if one of the date is undefined, return null
export function getLatestDate(dates: (Date | undefined)[]): Date | null {
  if (dates.includes(undefined)) return null;
  if (dates.length === 0) return null;
  let latest: Date | null = null;
  for (const date of dates) {
    if (date) {
      if (latest === null || date > latest) {
        latest = date;
      }
    }
  }
  return latest;
}

export function isOneDigitDay(dateStr: string) {
  return /\b\d\s\w{3}\b/.test(dateStr);
}
