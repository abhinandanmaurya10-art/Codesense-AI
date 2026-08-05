import { apiRequest, setAccessToken } from "./api";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

export async function loginUser(email: string, password: string) {
  const payload = await apiRequest<{
    data?: { user?: AuthUser; accessToken?: string; refreshToken?: string };
    user?: AuthUser;
    accessToken?: string;
    refreshToken?: string;
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // Backend wraps result under `data` (utils/response.ok). Support both shapes.
  const accessToken = payload?.data?.accessToken ?? payload.accessToken;
  if (!accessToken) throw new Error("Login did not return an access token");

  setAccessToken(accessToken);
  return payload;
}

export function logoutUser() {
  setAccessToken("");
}
