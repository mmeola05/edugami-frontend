import axios from "axios";
import { LocalStorage } from "quasar";
import { getToken } from "src/utils/authUtil";
import { captureApiError, createRequestContext, syncCorrelationFromResponse } from "src/utils/observability";

const axiosConfig = axios.create();

axiosConfig.interceptors.request.use(
  function (config) {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const lang = LocalStorage.getItem("edugami_lang"); // Keep EduGami key
    config.headers.langi18n = lang ? lang : "en-US"; // EduGami stores as string
    const { requestId, correlationId } = createRequestContext();
    config.headers["x-request-id"] = requestId;
    config.headers["x-correlation-id"] = correlationId;

    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

axiosConfig.interceptors.response.use(
  (response) => {
    syncCorrelationFromResponse(response);
    return response;
  },
  (error) => {
    syncCorrelationFromResponse(error.response);
    captureApiError(error);
    return Promise.reject(error);
  },
);

export default axiosConfig;
