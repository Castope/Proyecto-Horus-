// Public build-time setting. Never put credentials in a VITE_* variable.
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
