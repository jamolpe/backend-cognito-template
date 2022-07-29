export interface User {
  id?: string;
  cognitoId: string;
  email: string;
  email_verified?: boolean;
}
