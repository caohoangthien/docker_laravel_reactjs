import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken, getRefreshToken, setAccessToken } from "./authService";

type FailedRequestPromise = {
  resolve: (token: string) => void;
  reject: (error: any) => void;
};

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BE_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: FailedRequestPromise[] = [];

const processQueue = (err: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(err);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse<any, any>) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    const accessToken = getAccessToken();

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      accessToken
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = getRefreshToken();

      return new Promise(function (resolve, reject) {
        axiosInstance
          .post("refresh-token", { refresh_token: refreshToken })
          .then(({ data }) => {
            setAccessToken(data.access_token);

            axiosInstance.defaults.headers["Authorization"] =
              "Bearer " + data.access_token;
            originalRequest.headers["Authorization"] =
              "Bearer " + data.access_token;

            processQueue(null, data.access_token);
            resolve(axiosInstance(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
            originalRequest._retry = false;
          });
      });
    }
  }
);

export default axiosInstance;
