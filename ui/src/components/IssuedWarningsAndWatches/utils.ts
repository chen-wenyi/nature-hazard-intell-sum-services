import { DateTime } from 'luxon';
import type { SevereThunderstormLevel } from '../warnings-and-watches-indicators/severe-thunderstorm';

export const COLOR_CODE_MAP: { [key: string]: SevereThunderstormLevel } = {
  yellow: 'watch',
  orange: 'warning',
  red: 'red warning',
};

export function getPeriodDescription(onset: string, expires: string) {
  // 2026-01-15T20:00:00+13:00
  // use luxon to parse the date strings
  const onsetDate = DateTime.fromISO(onset);
  const expiresDate = DateTime.fromISO(expires);

  // format to this style 2100hrs Tues – 1800hrs Wed
  const onsetStr =
    onsetDate.day === expiresDate.day
      ? onsetDate.toFormat("HHmm'hrs'")
      : onsetDate.toFormat("HHmm'hrs' ccc");
  const expiresStr = expiresDate.toFormat("HHmm'hrs' ccc");

  return `${onsetStr} - ${expiresStr}`;
}

export function analyseDescription(description: string): {
  forecast: string;
  changes: string;
  impact: string;
} {
  const chunks1 = description.split('Changes:');
  const changes = chunks1.length > 1 ? chunks1[1].trim() : '';
  const chunks2 = chunks1[0].trim().split(/Chance of upgrading to a \w+:/);
  const chunks3 = chunks2[0].trim().split('Impact:');
  const impact = chunks3.length > 1 ? chunks3[1].trim() : '';
  const forecast = chunks3[0].trim();

  return {
    forecast,
    changes,
    impact,
  };
}
