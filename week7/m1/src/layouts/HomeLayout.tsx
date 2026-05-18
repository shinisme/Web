import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyInfo } from "../apis/auth";
import { useState, useEffect } from "react";
import type { ResMyInfoDto } from "../types/auth";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import { useMutation } from "@tanstack/react-query";
import {useQuery} from "@tanstack/react-query";
// 로그인 여부에 따라 헤더에 로그인/회원가입 버튼 또는 사용자 이름과 로그아웃 버튼을 보여주는 레이아웃

export default function HomeLayout() {
  const navigate = useNavigate();
  const { accessToken, logout } = useAuth();
  const { data } = useQuery({
  queryKey: ["myInfo"],
  queryFn: getMyInfo,
  enabled: !!accessToken,
  staleTime: 1000 * 60,
});

  const [setData] = useState<ResMyInfoDto>({} as ResMyInfoDto);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => navigate("/"),
  });

  useEffect(() => {
    if (!accessToken) return;
    const myData = async () => {
      try {
        const response = await getMyInfo();
        setData(response);
      } catch {
        // 토큰 만료 등으로 실패해도 레이아웃 유지
      }
    };
    myData();
  }, [accessToken]);

  return (
    <div className="h-dvh flex flex-col">

      {/* 헤더 */}
      <nav className="flex relative p-8 h-12 w-full items-center bg-[#0ECFD3] shrink-0 z-40 bg-[#0ECFD3] text-[#063B3D]">
        {/* 버거 버튼 */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="absolute left-4 text-black hover:text-black/70 transition-colors"
          aria-label="메뉴"
        >
          <svg width="26" height="26" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="none" stroke="currentColor" strokeLinecap="round"
              strokeLinejoin="round" strokeWidth="4"
              d="M7.95 11.95h32m-32 12h32m-32 12h32"
            />
          </svg>
        </button>

        <h1
          onClick={() => navigate("/")}
          className="absolute left-14 text-2xl font-bold cursor-pointer"
        >
          돌려돌려LP판
        </h1>

        {!accessToken && (
          <div className="absolute right-8 flex gap-2">
            <button onClick={() => navigate("/login")} className="rounded-md p-1 bg-[#0BAEB3] text-white">
              로그인
            </button>
            <button onClick={() => navigate("/signup")} className="rounded-md p-1 bg-white text-black">
              회원가입
            </button>
          </div>
        )}

        {accessToken && (
          <div className="absolute right-8 flex gap-2">
            <button onClick={() => navigate("/my")} className="rounded-md px-3 py-1 bg-white text-[#063B3D]">
              {`${data.data?.name ?? ""}님 반갑습니다.`}
            </button>
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="rounded-md p-1 pl-3 pr-3  bg-[#0BAEB3] text-white disabled:bg-gray-400"
            >
              {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
            </button>
          </div>
        )}
      </nav>

      {/* 사이드바 */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* 페이지 콘텐츠 */}
      <main className="flex-1 overflow-y-auto w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}