import { Request } from 'express';
export interface RequestUuid extends Request {
  uuid?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  start?: any;
  user?: UserSession;
  accessToken?: any;
}

export interface UserSession {
  email: string;
  cognitoId: string;
}
