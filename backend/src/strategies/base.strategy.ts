export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  uid: string;
  email: string;
}

export interface AuthStrategy {
  signup(credentials: AuthCredentials): Promise<AuthUser>;
  login(credentials: AuthCredentials): Promise<AuthUser>;
}
