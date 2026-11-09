import { getBaseUrl } from './baseUrl';

let authToken = null;

export function setApiToken(token) {
  authToken = token;
}

export function getApiToken() {
  return authToken;
}

export async function apiClient(endpoint, { method = 'GET', body = null, headers = {} } = {}) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const reqHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (authToken) {
    reqHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 detik timeout

  try {
    const config = {
      method,
      headers: reqHeaders,
      signal: controller.signal,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const res = await fetch(url, config);
    clearTimeout(timeoutId);

    let json;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    if (!res.ok) {
      const msg = json?.message || `Request failed with status ${res.status}`;
      throw new Error(msg);
    }

    return json?.data ?? json;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Timeout menghubungi server (${url}). Periksa IP laptop & WiFi.`);
    }
    if (err.message && err.message.includes('Network request failed')) {
      throw new Error(`Gagal terhubung ke ${url}. Pastikan server berjalan dan di WiFi yang sama.`);
    }
    throw err;
  }
}
