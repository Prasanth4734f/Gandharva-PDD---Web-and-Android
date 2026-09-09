import Constants from 'expo-constants';

let cachedWorkingBaseUrl = null;

export const setWorkingBaseUrl = (url) => {
  if (url) {
    cachedWorkingBaseUrl = url.replace(/\/$/, '');
  }
};

/**
 * Dynamically resolves all potential candidate URLs for the backend.
 * Works seamlessly across web, Android, iOS, local Wi-Fi, and cellular data.
 */
export const getCandidateUrls = () => {
  const candidates = [];

  // 1. Web origin host (when running in web browser)
  if (typeof window !== 'undefined' && window && window.location) {
    const hostname = window.location.hostname || 'localhost';
    candidates.push(`http://${hostname}:3000`);
    if (hostname !== 'localhost') {
      candidates.push('http://localhost:3000');
    }
    if (hostname !== '127.0.0.1') {
      candidates.push('http://127.0.0.1:3000');
    }
  }

  // 2. Explicit env override
  if (process.env.EXPO_PUBLIC_API_URL) {
    candidates.push(process.env.EXPO_PUBLIC_API_URL);
  }

  // 3. Auto-detected IP from Expo dev server hostUri (dynamic for physical devices)
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      Constants.manifest?.debuggerHost ||
      Constants.manifest2?.extra?.expoGo?.debuggerHost;

    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'undefined' && !ip.includes('ngrok') && !ip.includes('expo')) {
        candidates.push(`http://${ip}:3000`);
      }
    }
  } catch (e) {}

  // 4. Current machine WiFi IP & common LAN addresses
  candidates.push('http://192.168.1.8:3000');
  candidates.push('http://192.168.1.16:3000');
  candidates.push('http://localhost:3000');
  candidates.push('http://127.0.0.1:3000');
  candidates.push('http://10.0.2.2:3000');

  // Filter unique
  return [...new Set(candidates.filter(Boolean).map(u => u.replace(/\/$/, '')))];
};

/**
 * Fast parallel auto-discovery of working backend URL.
 */
export const autoDiscoverBackendUrl = async (timeoutMs = 2500) => {
  if (cachedWorkingBaseUrl) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 1000);
      const resp = await fetch(`${cachedWorkingBaseUrl}/api/health`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
        signal: controller.signal
      });
      clearTimeout(tid);
      if (resp.ok) return cachedWorkingBaseUrl;
    } catch (_) {
      cachedWorkingBaseUrl = null;
    }
  }

  const candidates = getCandidateUrls();
  const probe = (url) => new Promise((resolve) => {
    const controller = new AbortController();
    const tid = setTimeout(() => {
      controller.abort();
      resolve(null);
    }, timeoutMs);

    fetch(`${url}/api/health`, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
      signal: controller.signal
    })
      .then((res) => {
        clearTimeout(tid);
        if (res.ok) {
          setWorkingBaseUrl(url);
          resolve(url);
        } else {
          resolve(null);
        }
      })
      .catch(() => {
        fetch(`${url}/`, {
          headers: { 'ngrok-skip-browser-warning': 'true' },
          signal: controller.signal
        })
          .then((r) => {
            clearTimeout(tid);
            if (r.ok) {
              setWorkingBaseUrl(url);
              resolve(url);
            } else {
              resolve(null);
            }
          })
          .catch(() => {
            clearTimeout(tid);
            resolve(null);
          });
      });
  });

  try {
    const results = await Promise.all(candidates.map(probe));
    const found = results.find(Boolean);
    if (found) {
      setWorkingBaseUrl(found);
      return found;
    }
  } catch (_) {}

  return candidates[0] || 'http://localhost:3000';
};

export const getBaseUrl = () => {
  if (cachedWorkingBaseUrl) return cachedWorkingBaseUrl;
  const urls = getCandidateUrls();
  return urls[0] || 'http://localhost:3000';
};

export const API_BASE_URL = getBaseUrl();

const CONFIG = {
  get BASE_URL() {
    return getBaseUrl();
  },
  TIMEOUT_MS: 600000,
  API_PREFIX: '/api',
};

export default CONFIG;