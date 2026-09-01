import { z } from 'zod';

export const createProfileSchema = z.object({
  name: z
    .string({ required_error: 'Profile name is required' })
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  relationship: z
    .enum(['self', 'partner', 'parent', 'child', 'sibling', 'friend', 'other'])
    .default('self'),
  dateOfBirth: z
    .string({ required_error: 'Date of birth is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format'),
  timeOfBirth: z
    .string({ required_error: 'Time of birth is required' })
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time of birth must be in HH:mm or HH:mm:ss format'),
  placeName: z
    .string({ required_error: 'Birth place name is required' })
    .min(2, 'Place name must be at least 2 characters long')
    .max(200, 'Place name cannot exceed 200 characters')
    .trim(),
  latitude: z
    .number({ required_error: 'Latitude is required' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z
    .number({ required_error: 'Longitude is required' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  timezone: z
    .string({ required_error: 'Timezone is required' })
    .min(1, 'Timezone is required')
    .trim(),
  timezoneOffset: z
    .number()
    .min(-12, 'Timezone offset must be >= -12')
    .max(14, 'Timezone offset must be <= +14')
    .default(0),
  gender: z
    .enum(['male', 'female', 'other', 'undisclosed'])
    .default('undisclosed'),
  isPrimary: z.boolean().optional().default(false),
});

export const updateProfileSchema = createProfileSchema.partial();

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
