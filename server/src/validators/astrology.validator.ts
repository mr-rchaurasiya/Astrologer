import { z } from 'zod';

export const calculateChartSchema = z.object({
  profileId: z.string().optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
    .optional(),
  timeOfBirth: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time of birth must be in HH:mm or HH:mm:ss format')
    .optional(),
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .optional(),
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .optional(),
  timezone: z.string().optional(),
  timezoneOffset: z.number().min(-12).max(14).optional(),
}).refine(
  (data) => {
    // Either profileId is provided, or all birth params are provided
    if (data.profileId) return true;
    return !!(data.dateOfBirth && data.timeOfBirth && data.latitude !== undefined && data.longitude !== undefined);
  },
  {
    message: 'Either a valid profileId or full birth coordinates (dateOfBirth, timeOfBirth, latitude, longitude) must be provided',
  }
);

export const panchangQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  latitude: z.coerce.number().min(-90).max(90).default(23.1765),
  longitude: z.coerce.number().min(-180).max(180).default(75.7885),
  timezone: z.string().default('Asia/Kolkata'),
  timezoneOffset: z.coerce.number().min(-12).max(14).default(5.5),
});

export const transitQuerySchema = z.object({
  date: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).default(23.1765),
  longitude: z.coerce.number().min(-180).max(180).default(75.7885),
});

const birthInputSchema = z.object({
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeOfBirth: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().default('Asia/Kolkata'),
  timezoneOffset: z.number().min(-12).max(14).default(5.5),
});

export const compatibilitySchema = z.object({
  profile1Id: z.string().optional(),
  profile2Id: z.string().optional(),
  profile1: birthInputSchema.optional(),
  profile2: birthInputSchema.optional(),
}).refine(
  (data) => {
    const hasIds = !!(data.profile1Id && data.profile2Id);
    const hasInputs = !!(data.profile1 && data.profile2);
    return hasIds || hasInputs;
  },
  {
    message: 'Must provide either both profile IDs (profile1Id, profile2Id) or both birth coordinate inputs (profile1, profile2)',
  }
);
