export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

export function getApiUrl(path: string) {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getAccessToken() {
  return typeof window !== "undefined" ? localStorage.getItem("codesense_access_token") : null;
}

export function setAccessToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("codesense_access_token", token);
  }
}

export async function refreshAccessToken() {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const payload = await response.json().catch(() => null);
    const token = payload?.data?.accessToken ?? payload?.accessToken;

    if (!response.ok || !token) return null;
    setAccessToken(token);
    return token as string;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const url = getApiUrl(path);
  const accessToken = getAccessToken();

  const headers = new Headers(init.headers as HeadersInit | undefined);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response = await fetch(url, {
    credentials: "include",
    ...init,
    headers,
  });

  let payload = await response.json().catch(() => null);

  // If unauthorized, try to refresh the access token using refresh cookie and retry once.
  if (response.status === 401) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      // Retry the original request with the refreshed access token.
      const retryHeaders = new Headers(headers);
      retryHeaders.set("Authorization", `Bearer ${newAccess}`);
      response = await fetch(url, { credentials: "include", ...init, headers: retryHeaders });
      payload = await response.json().catch(() => null);
    }
  }

  if (!response.ok) {
    throw new Error(payload?.message ?? "API request failed");
  }

  return payload as T;
}
