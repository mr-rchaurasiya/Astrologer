/**
 * Time and Coordinate Transformations
 */

export interface ParsedTimeInput {
  utcDate: Date;
  julianDay: number;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/**
 * Calculates Julian Day from UTC Date using astronomical standard algorithms
 */
export const dateToJulianDay = (date: Date): number => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // 1-12
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds() + date.getUTCMilliseconds() / 1000;

  const dayFraction = (hour + minute / 60 + second / 3600) / 24;

  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    dayFraction +
    b -
    1524.5;

  return jd;
};

/**
 * Converts Julian Day back to UTC Date
 */
export const julianDayToDate = (jd: number): Date => {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;

  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }

  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);

  const dayNumber = b - d - Math.floor(30.6001 * e) + f;
  const day = Math.floor(dayNumber);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;

  const dayFraction = dayNumber - day;
  const totalSeconds = Math.round(dayFraction * 86400 * 1000) / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.round((totalSeconds - Math.floor(totalSeconds)) * 1000);

  return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds, milliseconds));
};

/**
 * Converts local date, time, and timezone offset to UTC Date & Julian Day
 */
export const parseBirthTimeToUtc = (
  dateOfBirth: string, // YYYY-MM-DD
  timeOfBirth: string, // HH:mm:ss or HH:mm
  timezoneOffsetHours: number // e.g. +5.5
): ParsedTimeInput => {
  const [yStr, mStr, dStr] = dateOfBirth.split('-');
  const timeParts = timeOfBirth.split(':');
  const hStr = timeParts[0] || '0';
  const minStr = timeParts[1] || '0';
  const sStr = timeParts[2] || '0';

  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const day = parseInt(dStr, 10);
  const hour = parseInt(hStr, 10);
  const minute = parseInt(minStr, 10);
  const second = parseFloat(sStr);

  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
    throw new Error('Invalid date or time format for birth calculation');
  }

  // Offset in milliseconds
  const offsetMs = timezoneOffsetHours * 3600 * 1000;

  // Treat local components as UTC timestamp, then subtract offset
  const localUtcBase = Date.UTC(year, month - 1, day, hour, minute, Math.floor(second), (second % 1) * 1000);
  const utcMs = localUtcBase - offsetMs;
  const utcDate = new Date(utcMs);

  const julianDay = dateToJulianDay(utcDate);

  return {
    utcDate,
    julianDay,
    year,
    month,
    day,
    hour,
    minute,
    second,
  };
};
