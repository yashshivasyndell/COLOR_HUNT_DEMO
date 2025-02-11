
// Generic type of api response
export interface apiResponse<T = any> {
  statusCode: number;
  message: string;
  success: boolean;
  errors?: any;
  stack?: string;
  auth_token?:string;
  data: T;
}

export class apiError extends Error{
  constructor(
    message: string,
    public statusCode: number,
    public errors?: any
  ){
    super(message);
    this.name = 'ApiError'
  }
}
