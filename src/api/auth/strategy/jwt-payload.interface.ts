export interface JwtPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
  is2FaAuthenticated: boolean;
  is2FaEnabled: boolean;
}

export interface adminJwtPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
}
