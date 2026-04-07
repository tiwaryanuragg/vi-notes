let accessToken: string | null = null;

export function getAuthToken() {
  return accessToken;
}

export function setAuthToken(token: string | null) {
  accessToken = token;
}
