import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { DateTime } from 'luxon';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseNZIssuedDate(issued: string, year?: number): Date {
  console.log('Parsing issued date:', issued, 'with year:', year);

  const y = year ?? new Date().getFullYear(); // add a year if missing
  const withYear = /\b\d{4}\b/.test(issued) ? issued : `${issued} ${y}`;

  console.log('Issued date with year:', withYear);

  // test if the format is valid i.e. 10:19am Tue, 23 Dec 2023
  const isValidFormat =
    /^\d{1,2}:\d{2}[ap]m\s+\w+,\s+\d{1,2}\s+\w+\s+\d{4}$/i.test(withYear);
  if (!isValidFormat) throw new Error(`Invalid issuedDate format: ${issued}`);

  const dt = DateTime.fromFormat(withYear, 'h:mma EEE, d LLL yyyy', {
    zone: 'Pacific/Auckland',
  });
  if (dt.isValid) return dt.toJSDate(); // JS Date in UTC (same instant)
  throw new Error(`Invalid issuedDate: ${issued}`);
}

export function formatUTCToNZDate(
  utcDate: Date,
  formatStr: string = 'h:mma EEE, d LLL yyyy',
): string {
  const dt = DateTime.fromJSDate(utcDate, { zone: 'Pacific/Auckland' });
  return dt.toFormat(formatStr);
}

export function isTodayInNZ(date: Date): boolean {
  const today = DateTime.fromJSDate(new Date(), { zone: 'Pacific/Auckland' });
  const targetDate = DateTime.fromJSDate(date, { zone: 'Pacific/Auckland' });
  return (
    today.year === targetDate.year &&
    today.month === targetDate.month &&
    today.day === targetDate.day
  );
}
