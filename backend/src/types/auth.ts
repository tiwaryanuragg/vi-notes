export type AuthRole = "Student" | "Professional" | "Writer";

export interface JwtUserPayload {
  id: string;
  email: string;
  fullName: string;
  role: AuthRole;
}

export interface JwtRefreshPayload {
  id: string;
  type: "refresh";
}

export interface AuthUserPublic {
  id: string;
  email: string;
  fullName: string;
  role: AuthRole;
  createdAt: string;
}
