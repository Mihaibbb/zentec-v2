import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: `${API_URL}/api`
});

export function setAuthToken(token?: string) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

export function setClinicContext(clinicId?: number) {
  if (clinicId) api.defaults.headers.common["x-clinic-id"] = String(clinicId);
  else delete api.defaults.headers.common["x-clinic-id"];
}

export function saveToken(token: string) {
  localStorage.setItem("token", token);
  setAuthToken(token);
}

export function loadToken() {
  const t = localStorage.getItem("token");
  if (t) setAuthToken(t);
  return t;
}

export type AuthUser = {
  id: number;
  role: "super-admin" | "admin" | "doctor";
  clinicId?: number | null;
  email: string;
};

export function getCurrentUser(): AuthUser | null {
  const t = localStorage.getItem("token");
  if (!t) return null;
  try {
    const payload = t.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded as AuthUser;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("token");
  setAuthToken(undefined);
  setClinicContext(undefined);
}

