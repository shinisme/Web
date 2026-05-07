import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomeLayout() {
    const navigate = useNavigate();
    const { accessToken } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="h-dvh flex flex-col bg-[#F4FFFC]">
            <header className="h-[64px] w-full flex items-center justify-between px-8 bg-[#0ECFD3] text-[#063B3D]">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="block md:hidden text-[#063B3D]"
                    >
                         <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M7.95 11.95h32m-32 12h32m-32 12h32"/></svg>
                    </button>

                    <h1 onClick={() => navigate("/")} className="text-2xl font-bold cursor-pointer">돌려돌려LP판</h1>
                </div>

                <div className="flex items-center gap-2">
                    {!accessToken ? (
                        <>
                            <button onClick={() => navigate("/login")} className="rounded-md px-3 py-1 bg-[#0BAEB3] text-white">로그인</button>
                            <button onClick={() => navigate("/signup")} className="rounded-md px-3 py-1 bg-white text-[#063B3D]">회원가입</button>
                        </>
                    ) : (
                        <span className="font-bold">반갑습니다.</span>
                    )}
                </div>
            </header>

            <div className="flex flex-1 relative">
                {isSidebarOpen && (
                    <div
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/30 z-10 md:hidden"
                    />
                )}

                <aside className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:static top-0 left-0 z-20 w-[220px] h-full bg-[#063B3D] text-white transition-transform duration-300 flex flex-col justify-between`}>
                    <div>
                        <div className="h-[64px] flex items-center px-6 font-bold text-[#0ECFD3] md:hidden">
                            MENU
                        </div>

                        <nav className="flex flex-col gap-4 p-6">
                            <button onClick={() => navigate("/")} className="text-left hover:text-[#0ECFD3]">찾기</button>
                            <button onClick={() => navigate("/my")} className="text-left hover:text-[#0ECFD3]">마이페이지</button>
                        </nav>
                    </div>

                    <button className="p-6 text-left hover:text-[#0ECFD3]">탈퇴하기</button>
                </aside>

                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>

                <button
                    onClick={() => navigate("/lp/create")}
                    className="fixed right-8 bottom-8 w-[56px] h-[56px] rounded-full bg-[#0ECFD3] text-[#063B3D] text-3xl font-bold shadow-lg hover:bg-[#0BAEB3] hover:text-white"
                >
                    +
                </button>
            </div>
        </div>
    )
}