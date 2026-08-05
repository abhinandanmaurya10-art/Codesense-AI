export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

export function getAccessToken() {
  return typeof window !== "undefined" ? localStorage.getItem("codesense_access_token") : null;
}

export function setAccessToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("codesense_access_token", token);
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
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
    try {
      const refreshResp = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const refreshPayload = await refreshResp.json().catch(() => null);
      const newAccess = refreshPayload?.data?.accessToken ?? refreshPayload?.accessToken;
      if (newAccess) {
        setAccessToken(newAccess);
        // retry original request with new token
        const retryHeaders = new Headers(headers);
        retryHeaders.set("Authorization", `Bearer ${newAccess}`);
        response = await fetch(url, { credentials: "include", ...init, headers: retryHeaders });
        payload = await response.json().catch(() => null);
      }
    } catch (e) {
      // ignore refresh errors and fall through to original error handling
    }
  }

  if (!response.ok) {
    throw new Error(payload?.message ?? "API request failed");
  }

  return payload as T;
}
