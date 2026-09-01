/**
 * Utility functions for API response formatting and validation
 */

import { ApiSuccessResponse, ApiErrorResponse } from '../types';

export const createSuccessResponse = <T>(data: T, message: string = 'Operation successful'): ApiSuccessResponse<T> => ({
  success: true,
  message,
  data,
});

export const createErrorResponse = (message: string, code: string = 'ERROR', details?: any): ApiErrorResponse => ({
  success: false,
  message,
  error: {
    code,
    ...(details ? { details } : {}),
  },
});
