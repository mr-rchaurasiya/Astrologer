export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorDetail {
  code: string;
  details?: any;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: ApiErrorDetail;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface HealthData {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
}
