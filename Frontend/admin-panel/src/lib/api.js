import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  // Empty string uses Vite proxy in local dev (see vite.config.js)
  baseURL: import.meta.env.VITE_API_URL || '',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/** Convert rupees (form UI) → paise (API). */
export function toPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

/** Convert paise (API) → rupees (form UI). Display only — never send back. */
export function toRupees(paise) {
  return Number(paise) / 100;
}

/** datetime-local value → ISO string for API. */
export function toIso(datetimeLocal) {
  return new Date(datetimeLocal).toISOString();
}

/** ISO string → datetime-local value for inputs. */
export function toDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Title → kebab-case slug. */
export function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
