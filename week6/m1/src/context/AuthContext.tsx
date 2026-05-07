/*
1. localStorage에서 accessToken, refreshToken 꺼냄
2. React state에도 accessToken, refreshToken 저장
3. login 함수 만듦
4. logout 함수 만듦
5. AuthProvider로 앱 전체에 로그인 상태 공급
6. useAuth로 아무 컴포넌트에서나 로그인 정보 꺼내 쓰게 함
→ 앱 전체에서 로그인/로그아웃 기능을 쓸 수 있게 해주는 파일
*/

import {
  createContext,
  useState,
  useContext,
  type PropsWithChildren,
} from "react";

import { postSignin, postLogout } from "../apis/auth";
// 로그인, 로그아웃 API 요청

import { LOCAL_STORAGE_KEY } from "../constants/key";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { type ReqSignInDto } from "../types/auth";

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  login: (signInData: ReqSignInDto) => Promise<void>;
  logout: () => Promise<void>;
}
// 로그인 되어 있음 → 토큰 문자열 있음
// 로그인 안 됨 → null

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  refreshToken: null,
  login: async () => {},
  logout: async () => {},
});
// 로그인 상태 보관함 만들기

export const AuthProvider = ({ children }: PropsWithChildren) => {
  // App 안의 모든 컴포넌트가 로그인 정보를 쓸 수 있게 해주기

  const {
    getItem: getAccessTokenInStorage,
    setItem: setAccessTokenInStorage,
    removeItem: removeAccessTokenInStorage,
  } = useLocalStorage(LOCAL_STORAGE_KEY.ACCESS_TOKEN);
  // localStorage 함수 꺼내기 accessToken 용

  const {
    getItem: getRefreshTokenInStorage,
    setItem: setRefreshTokenInStorage,
    removeItem: removeRefreshTokenInStorage,
  } = useLocalStorage(LOCAL_STORAGE_KEY.REFRESH_TOKEN);
  // localStorage 함수 꺼내기 refreshToken 용

  const [accessToken, setAccessToken] = useState<string | null>(
    getAccessTokenInStorage()
  );

  const [refreshToken, setRefreshToken] = useState<string | null>(
    getRefreshTokenInStorage()
  );
  // React state 만들어 로그인 상태 관리하기
  // Header가 바로 바뀌도록 하기 위함

  const login = async (signInData: ReqSignInDto) => {
    try {
      const { data } = await postSignin(signInData);
      // 서버에 로그인 요청 보내기

      if (data) {
        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;
        // 성공하면 서버 응답에서 토큰 꺼냄

        setAccessTokenInStorage(newAccessToken);
        setRefreshTokenInStorage(newRefreshToken);
        // 토큰을 localStorage에 저장
        // 새로고침해도 로그인 유지하려고

        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        // React state에도 토큰 저장
        // 화면 바로 바뀌게 하려고
      }

      alert("로그인 성공!");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const logout = async () => {
    try {
      await postLogout();
      // 서버에 로그아웃 요청 보내기

      removeAccessTokenInStorage();
      removeRefreshTokenInStorage();
      // localStorage에서 토큰 삭제

      setAccessToken(null);
      setRefreshToken(null);
      // React state에서도 토큰 삭제
      // 즉 로그아웃 상태로 바꿈
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
// Provider로 공급하기
// 자식 컴포넌트들이 로그인 정보 쓸 수 있게 함

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
  }

  return context;
};