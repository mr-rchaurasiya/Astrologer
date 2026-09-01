import { z } from 'zod';

export const pointContextSchema = z.object({
  type: z.enum(['planet', 'house', 'nakshatra', 'dasha', 'chart']),
  id: z.string().min(1).max(50),
  label: z.string().max(100).optional(),
});

export const sendChatMessageSchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
  sessionId: z.string().optional(),
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message cannot exceed 4000 characters')
    .trim(),
  pointContext: pointContextSchema.optional(),
});

export const createSessionSchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
  title: z.string().max(120).optional(),
});

export const getMessagesQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  before: z.string().datetime().optional(),
});

export const generateReportSchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
  reportType: z.enum([
    'FULL_KUNDLI_REPORT',
    'CAREER_REPORT',
    'MARRIAGE_REPORT',
    'EDUCATION_REPORT',
    'FINANCE_REPORT',
    'YEARLY_FORECAST',
    'DASHA_REPORT',
    'TRANSIT_REPORT',
    'COMPATIBILITY_REPORT',
  ]),
  personalization: z
    .object({
      language: z.string().optional(),
      responseStyle: z.enum(['CONCISE', 'BALANCED', 'DETAILED', 'EXPERT', 'BEGINNER']).optional(),
    })
    .optional(),
});
