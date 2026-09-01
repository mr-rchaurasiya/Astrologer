import { MuhurtaInfo, TimeWindow } from '../types/astrology';

// Octant index (1 to 8) for each day of week (0: Sun, 1: Mon, ..., 6: Sat)
const RAHU_KAAL_PARTS = [8, 2, 7, 5, 6, 4, 3];
const GULIKA_KAAL_PARTS = [7, 6, 5, 4, 3, 2, 1];
const YAMAGANDA_PARTS = [5, 4, 3, 2, 1, 7, 6];

/**
 * Calculates dynamic daytime octant window [start, end]
 */
const getDayPartWindow = (
  sunrise: Date,
  partIndex: number, // 1 to 8
  partDurationMs: number
): { startTime: string; endTime: string } => {
  const startMs = sunrise.getTime() + (partIndex - 1) * partDurationMs;
  const endMs = startMs + partDurationMs;
  return {
    startTime: new Date(startMs).toISOString(),
    endTime: new Date(endMs).toISOString(),
  };
};

/**
 * Calculates traditional Vedic Muhurta windows for a given date and local sun times
 */
export const calculateMuhurtas = (
  dateStr: string,
  utcDate: Date,
  sunriseIso: string,
  sunsetIso: string
): MuhurtaInfo => {
  const sunrise = new Date(sunriseIso);
  const sunset = new Date(sunsetIso);

  const dayDurationMs = sunset.getTime() - sunrise.getTime();
  const octantDurationMs = dayDurationMs / 8.0;
  const dayOfWeek = utcDate.getUTCDay(); // 0 (Sun) to 6 (Sat)

  // 1. Rahu Kaal (Inauspicious)
  const rahuPart = RAHU_KAAL_PARTS[dayOfWeek];
  const rahuWindow = getDayPartWindow(sunrise, rahuPart, octantDurationMs);
  const rahuKaal: TimeWindow = {
    name: 'Rahu Kaal',
    startTime: rahuWindow.startTime,
    endTime: rahuWindow.endTime,
    type: 'inauspicious',
    description: 'Inauspicious window governed by Rahu. Avoid initiating new ventures or travel.',
  };

  // 2. Gulika Kaal (Auspicious / Neutral depending on tradition)
  const gulikaPart = GULIKA_KAAL_PARTS[dayOfWeek];
  const gulikaWindow = getDayPartWindow(sunrise, gulikaPart, octantDurationMs);
  const gulikaKaal: TimeWindow = {
    name: 'Gulika Kaal',
    startTime: gulikaWindow.startTime,
    endTime: gulikaWindow.endTime,
    type: 'inauspicious',
    description: 'Window ruled by Gulika (son of Saturn). Undertakings started here tend to repeat.',
  };

  // 3. Yamaganda Kaal (Inauspicious)
  const yamaPart = YAMAGANDA_PARTS[dayOfWeek];
  const yamaWindow = getDayPartWindow(sunrise, yamaPart, octantDurationMs);
  const yamagandaKaal: TimeWindow = {
    name: 'Yamaganda Kaal',
    startTime: yamaWindow.startTime,
    endTime: yamaWindow.endTime,
    type: 'inauspicious',
    description: 'Period ruled by Yama. Not favorable for important business or financial decisions.',
  };

  // 4. Abhijit Muhurta (Highly Auspicious)
  // 8th muhurta of 15 daytime muhurtas
  const muhurtaDurationMs = dayDurationMs / 15.0;
  const abhijitStartMs = sunrise.getTime() + 7 * muhurtaDurationMs;
  const abhijitEndMs = sunrise.getTime() + 8 * muhurtaDurationMs;
  const abhijitMuhurta: TimeWindow = {
    name: 'Abhijit Muhurta',
    startTime: new Date(abhijitStartMs).toISOString(),
    endTime: new Date(abhijitEndMs).toISOString(),
    type: 'auspicious',
    description: 'Midday auspicious window capable of destroying malefic influences (except on Wednesdays).',
  };

  // 5. Brahma Muhurta (Pre-dawn Spiritual Window)
  // 96 mins to 48 mins before sunrise
  const brahmaStartMs = sunrise.getTime() - 96 * 60 * 1000;
  const brahmaEndMs = sunrise.getTime() - 48 * 60 * 1000;
  const brahmaMuhurta: TimeWindow = {
    name: 'Brahma Muhurta',
    startTime: new Date(brahmaStartMs).toISOString(),
    endTime: new Date(brahmaEndMs).toISOString(),
    type: 'auspicious',
    description: 'Sacred pre-dawn window of maximum sattva energy ideal for meditation and spiritual study.',
  };

  return {
    date: dateStr,
    rahuKaal,
    gulikaKaal,
    yamagandaKaal,
    abhijitMuhurta,
    brahmaMuhurta,
  };
};
