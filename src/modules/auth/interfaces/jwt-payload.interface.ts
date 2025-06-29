export interface JwtPayload {
  sub: string; // Subject (user ID)
  email: string;
  iat?: number; // Issued at
  exp?: number; // Expiration time
  roles?: string[];
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    isEmailVerified: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}
