import { apiRequest, setAccessToken } from "./api";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthResponse {
  data?: { user?: AuthUser; accessToken?: string; refreshToken?: string };
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
}

function saveAuthToken(payload: AuthResponse) {
  const accessToken = payload.data?.accessToken ?? payload.accessToken;
  if (!accessToken) throw new Error("Authentication did not return an access token");
  setAccessToken(accessToken);
}

export async function loginUser(email: string, password: string) {
  const payload = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  saveAuthToken(payload);
  return payload;
}

export async function registerUser(email: string, password: string) {
  const payload = await apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  saveAuthToken(payload);
  return payload;
}

export async function logoutUser() {
  setAccessToken("");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    await apiRequest("/auth/logout", { method: "POST", signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
