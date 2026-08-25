import type { ApiErrorBody } from './types';

// Relative by default: in production the API is served from this same origin (see root
// server.js), and in dev the Vite proxy below forwards /api and /uploads to the API
// port — same-origin either way, which sidesteps CORS and cross-port cookie scoping
// entirely. Only set VITE_API_URL for a split deployment where the API lives elsewhere.
const API_URL = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string[]>;

  constructor(status: number, message: string, fields?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

async function fetchCsrfToken(): Promise<string> {
  const res = await fetch(`${API_URL}/api/csrf-token`, { credentials: 'include' });
  const data = (await res.json()) as { csrfToken: string };
  csrfToken = data.csrfToken;
  return csrfToken;
}

async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  if (!csrfPromise) csrfPromise = fetchCsrfToken().finally(() => { csrfPromise = null; });
  return csrfPromise;
}

// The CSRF token is bound to the session identifier (access cookie vs anonymous/IP) —
// call this right after login/register/logout so the next mutation fetches a token
// scoped to the new session instead of relying on the 403-retry path.
export function invalidateCsrfToken(): void {
  csrfToken = null;
}

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  skipAuthRetry?: boolean;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  // Base is only needed when API_URL is relative ('') — a bare path like "/api/x" isn't
  // a valid absolute URL on its own, so the URL constructor would otherwise throw.
  const url = new URL(`${API_URL}${path}`, window.location.origin);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function rawRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method || 'GET';
  const headers: Record<string, string> = {};
  let body: string | undefined;

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  if (MUTATING_METHODS.has(method)) {
    headers['x-csrf-token'] = await getCsrfToken();
  }

  const res = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    body,
    credentials: 'include',
  });

  if (res.status === 204) return undefined as T;

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : undefined;

  if (!res.ok) {
    const errBody = data as ApiErrorBody | undefined;
    throw new ApiError(res.status, errBody?.error?.message || 'Erro inesperado', errBody?.error?.fields);
  }

  return data as T;
}

// Refresh cookies are httpOnly, so we can't tell client-side whether the user is
// still logged in without asking the server — a 401 on an authed call triggers one
// silent refresh attempt before giving up, so a still-valid session survives an
// expired 15-minute access token without forcing a re-login.
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await rawRequest<T>(path, options);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && !options.skipAuthRetry && path !== '/api/auth/refresh') {
      try {
        await rawRequest('/api/auth/refresh', { method: 'POST' });
      } catch {
        throw err;
      }
      return rawRequest<T>(path, { ...options, skipAuthRetry: true });
    }
    if (err instanceof ApiError && err.status === 403 && err.message.toLowerCase().includes('csrf')) {
      csrfToken = null;
      await getCsrfToken();
      return rawRequest<T>(path, options);
    }
    throw err;
  }
}

// Multipart upload — deliberately bypasses rawRequest/apiRequest since it must NOT set
// a JSON Content-Type header (the browser needs to set its own multipart boundary).
export async function uploadFile(file: File, kind: 'image' | 'video'): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('kind', kind);
  formData.append('file', file);

  const send = async () => {
    const res = await fetch(`${API_URL}/api/uploads`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'x-csrf-token': await getCsrfToken() },
      body: formData,
    });
    const data = await res.json().catch(() => undefined);
    if (!res.ok) {
      const errBody = data as ApiErrorBody | undefined;
      throw new ApiError(res.status, errBody?.error?.message || 'Falha no upload', errBody?.error?.fields);
    }
    return data as { url: string };
  };

  try {
    return await send();
  } catch (err) {
    if (err instanceof ApiError && err.status === 403 && err.message.toLowerCase().includes('csrf')) {
      csrfToken = null;
      return send();
    }
    throw err;
  }
}

export const api = {
  get: <T>(path: string, query?: RequestOptions['query']) => apiRequest<T>(path, { method: 'GET', query }),
  post: <T>(path: string, bodyData?: unknown) => apiRequest<T>(path, { method: 'POST', body: bodyData }),
  patch: <T>(path: string, bodyData?: unknown) => apiRequest<T>(path, { method: 'PATCH', body: bodyData }),
  put: <T>(path: string, bodyData?: unknown) => apiRequest<T>(path, { method: 'PUT', body: bodyData }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
};

export function productImageUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
}
