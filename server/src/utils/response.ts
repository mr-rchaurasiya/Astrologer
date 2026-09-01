import { Response } from 'express';

export interface StandardSuccessResponse<T = any> {
  success: true;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export interface StandardErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: any;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
  meta?: StandardSuccessResponse<T>['meta']
): Response => {
  const payload: StandardSuccessResponse<T> = {
    success: true,
    ...(message ? { message } : {}),
    data,
    ...(meta ? { meta } : {}),
  };
  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  errorCode: string,
  message: string,
  statusCode: number = 400,
  details?: any
): Response => {
  const requestId = (res.req as any)?.id || res.req?.headers['x-request-id'];
  const payload: StandardErrorResponse = {
    success: false,
    message,
    error: {
      code: errorCode,
      message,
      ...(requestId ? { requestId } : {}),
      ...(details ? { details } : {}),
    },
  };
  return res.status(statusCode).json(payload);
};
