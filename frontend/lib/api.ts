import type { Opportunity, Paginated } from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export const SERVER_API_URL =
  process.env.API_INTERNAL_URL || "http://127.0.0.1:8000/api";

const FETCH_OPTS: RequestInit = { cache: "no-store" };

async function get<T>(path: string, base = API_URL): Promise<T> {
  const res = await fetch(`${base}${path}`, FETCH_OPTS);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export function unwrap<T>(data: T[] | Paginated<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

export async function fetchOpportunitiesServer(params = ""): Promise<Opportunity[]> {
  try {
    const data = await get<Opportunity[] | Paginated<Opportunity>>(
      `/opportunities/${params}`,
      SERVER_API_URL
    );
    return unwrap(data);
  } catch {
    return [];
  }
}

export async function fetchOpportunities(params = "", base = API_URL): Promise<Opportunity[]> {
  const data = await get<Opportunity[] | Paginated<Opportunity>>(`/opportunities/${params}`, base);
  return unwrap(data);
}

export async function fetchOpportunity(slug: string, base = SERVER_API_URL) {
  return get<import("./types").OpportunityDetail>(`/opportunities/${slug}/`, base);
}

export async function postChat(message: string) {
  const res = await fetch(`${API_URL}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("The assistant is unavailable right now.");
  return res.json();
}

export async function subscribe(email: string) {
  const res = await fetch(`${API_URL}/newsletter/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.ok;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sp_access");
}

export function setTokens(access: string, refresh?: string) {
  localStorage.setItem("sp_access", access);
  if (refresh) localStorage.setItem("sp_refresh", refresh);
  window.dispatchEvent(new Event("sp-auth"));
}

export function clearTokens() {
  localStorage.removeItem("sp_access");
  localStorage.removeItem("sp_refresh");
  window.dispatchEvent(new Event("sp-auth"));
}

export async function authFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  return res;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }),
  });
  if (!res.ok) throw new Error("Wrong email or password.");
  const data = await res.json();
  setTokens(data.access, data.refresh);
  return data;
}

export async function register(payload: Record<string, string>) {
  const res = await fetch(`${API_URL}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const first = Object.values(body)[0];
    throw new Error(Array.isArray(first) ? String(first[0]) : "Could not create your account.");
  }
  return res.json();
}

export async function fetchMe() {
  const res = await authFetch("/auth/me/");
  if (!res.ok) return null;
  return res.json();
}
