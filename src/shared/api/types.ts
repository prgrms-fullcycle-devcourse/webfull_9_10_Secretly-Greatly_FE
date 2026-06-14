/** BE 공통 응답 래퍼 (statusCode·message·data·error). */
export interface APIResponse<T> {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  data: T;
  error: string | null;
}
