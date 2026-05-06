import axios from 'axios';
import { LocalStorage } from 'quasar';
import { getToken, removeTokens } from 'src/utils/authUtil';
import { notifyError, notifyWarning, notifyErrorBack } from 'src/utils/utils';
import { captureApiError, createRequestContext, syncCorrelationFromResponse } from 'src/utils/observability';

// Dynamic Base URL logic from user requirement
const devMode = process.env.DEV;
let ip = devMode ? (process.env.VITE_API_IP || 'localhost') : (process.env.VITE_API_IP_PROD || 'localhost');
let port = devMode ? (process.env.VITE_API_PORT || '7002') : (process.env.VITE_API_PORT_PROD || '7002');

if (LocalStorage.getItem('ip')) {
  ip = LocalStorage.getItem('ip');
}
if (LocalStorage.getItem('port')) {
  port = LocalStorage.getItem('port');
}

const baseUrl = `http://${ip}:${port}/api/v1`;

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000 // Added timeout for better error handling
});

// Auth & Language interceptor
api.interceptors.request.use((config) => {
  // Auth Token
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Language Header (from axiosConfig pattern)
  const lang = LocalStorage.getItem('edugami_lang') || 'en-US';
  config.headers.langi18n = lang;
  const { requestId, correlationId } = createRequestContext();
  config.headers['x-request-id'] = requestId;
  config.headers['x-correlation-id'] = correlationId;

  return config;
}, (error) => Promise.reject(error));

/**
 * Response Handler
 * Implements the robust error handling logic requested by the user
 */
api.interceptors.response.use(
  (response) => {
    syncCorrelationFromResponse(response);
    const { data } = response;

    // Logic for internal business errors returned as 200 (common in legacy or specific APIs)
    if (data.error && data.error.status) {
      if (data.error.code === 54321) {
        notifyErrorBack(data.error.source);
      } else if (data.error.code === 2) {
        notifyWarning('warningNoAllImage');
      } else {
        notifyError('defaultError');
      }
      return response;
    }

    // Logic for token errors within 200 responses
    if (data.tokenError) {
      handleCloseSession();
    }

    return response;
  },
  (error) => {
    syncCorrelationFromResponse(error.response);
    captureApiError(error);
    // Session expiry / Unauthorized
    if (error.response && error.response.status === 401) {
      if (!error.config.url.includes('/auth/login')) {
        handleCloseSession();
      }
    }

    // Network errors / Timeouts
    if (error.code !== 'ECONNABORTED' && !error.response) {
      notifyError('No se pudo establecer conexión con el servidor.');
    } else if (error.code === 'ECONNABORTED') {
      notifyWarning('La solicitud ha tardado demasiado tiempo.');
    }

    return Promise.reject(error);
  }
);

function handleCloseSession() {
  removeTokens();
  // Clear other user data if needed
  window.location.href = '/auth/login';
}

export default api;
