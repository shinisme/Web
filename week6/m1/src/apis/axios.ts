/*
서버 요청 보낼 때 accessToken 자동으로 붙이기
→ 만약 accessToken 만료돼서 401 에러 나면
→ refreshToken으로 accessToken 새로 받기
→ 원래 실패했던 요청 다시 보내기
→ refreshToken도 죽었으면 로그인 페이지로 보내기
*/

import axios, { type InternalAxiosRequestConfig } from "axios";
import { LOCAL_STORAGE_KEY } from "../constants/key";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean; // 요청이 재시도되었는지 여부를 나타내는 플래그
}

// 전역 변수로 refresh 요청의 Promise를 저장하여 중복 요청 방지
let refreshPromise: Promise<string> | null = null;

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const { getItem } = useLocalStorage(LOCAL_STORAGE_KEY.ACCESS_TOKEN);
    const token = getItem();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (err) => Promise.reject(err)
);

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config as CustomInternalAxiosRequestConfig;

    if (
      err.response &&
      err.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (originalRequest.url === "/v1/auth/refresh") {
        const { removeItem: removeAccessToken } = useLocalStorage(
          LOCAL_STORAGE_KEY.ACCESS_TOKEN
        );

        const { removeItem: removeRefreshToken } = useLocalStorage(
          LOCAL_STORAGE_KEY.REFRESH_TOKEN
        );

        removeAccessToken();
        removeRefreshToken();

        window.location.href = "/login";

        return Promise.reject(err);
      }

      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = (async () => {
          const { getItem: getRefreshToken } = useLocalStorage(
            LOCAL_STORAGE_KEY.REFRESH_TOKEN
          );

          const refreshToken = getRefreshToken();

          const { data } = await axiosInstance.post("/v1/auth/refresh", {
            refreshToken,
          });

          const { setItem: setAccessToken } = useLocalStorage(
            LOCAL_STORAGE_KEY.ACCESS_TOKEN
          );

          const { setItem: setRefreshToken } = useLocalStorage(
            LOCAL_STORAGE_KEY.REFRESH_TOKEN
          );

          setAccessToken(data.data.accessToken);
          setRefreshToken(data.data.refreshToken);

          // refresh 요청이 완료된 후, 새로운 accessToken을 반환
          return data.data.accessToken;
        })()
          .catch((err) => {
            const { removeItem: removeAccessToken } = useLocalStorage(
              LOCAL_STORAGE_KEY.ACCESS_TOKEN
            );

            const { removeItem: removeRefreshToken } = useLocalStorage(
              LOCAL_STORAGE_KEY.REFRESH_TOKEN
            );

            removeAccessToken();
            removeRefreshToken();

            window.location.href = "/login";

            return Promise.reject(err);
          })
          .finally(() => {
            refreshPromise = null; // 요청이 완료되면 다시 null로 초기화
          });
      }

      // refreshPromise가 이미 존재한다면, 해당 Promise가 해결될 때까지 기다렸다가 새로운 accessToken으로 원래 요청을 재시도
      return refreshPromise.then((newAccessToken) => {
        // 원래 요청의 Authorization 헤더를 새로운 accessToken으로 업데이트
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 원래 요청을 재시도
        return axiosInstance.request(originalRequest);
      });
    }

    // 401 에러가 refresh 요청에서 발생했거나, 다른 이유로 발생한 경우에는 에러를 그대로 반환
    return Promise.reject(err);
  }
);