export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: string[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface AuthTokenResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface UserPayload {
  id: string;
  email: string;
  status: string;
}