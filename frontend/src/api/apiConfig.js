const configuredApiUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5281')
  .replace(/\/+$/, '');

export const API_ROOT_URL = configuredApiUrl.endsWith('/api/v1')
  ? configuredApiUrl.slice(0, -7)
  : configuredApiUrl;

export const API_BASE_URL = `${API_ROOT_URL}/api/v1`;
export const SIGNALR_HUB_URL = `${API_ROOT_URL}/chatHub`;