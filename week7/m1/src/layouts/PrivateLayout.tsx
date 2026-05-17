import { Outlet, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyInfo } from "../apis/auth";
import { useState, useEffect } from "react";
import type { ResMyInfoDto } from "../types/auth";

const PrivateLayout = () => {
    const navigate = useNavigate();
    const {accessToken, logout} = useAuth();

    const handleLogout = async () => {
            await logout();
            navigate("/");
    }

    const [data, setData] = useState<ResMyInfoDto>({} as ResMyInfoDto);

    useEffect(() => {
        const myData = async () => {
            const response = await getMyInfo();
            console.log(response);
            setData(response);
        }

        myData();
    }, [accessToken]);

    if (!accessToken) {
        return <Navigate to={"/login"} replace />; // 뒤로 가기 했을 때 history에 로그인 페이지가 남지 않도록 replace 옵션 사용
    }
    
    return (
        <div className="h-dvh flex flex-col">
            <nav className="flex relative p-8 h-12 w-full items-center bg-[#0ECFD3]">
                <h1 onClick={() => navigate("/")} className="absolute left-8 text-2xl font-bold">돌려돌려LP판</h1>
                {!accessToken && (
                    <div className="absolute right-8 flex gap-2">
                        <button onClick={() => navigate("/login")} className="rounded-md p-1 bg-[#0BAEB3] text-white">로그인</button>
                        <button onClick={() => navigate("/signup")} className="rounded-md p-1 bg-white text-black">회원가입</button>
                    </div>
                )}
                {accessToken && (
                    <div className="absolute right-8 flex gap-2">
                        <button onClick={() => navigate("/my")} className="rounded-md p-1 pl-3 pr-3 bg-white text-black">{`${data.data?.name}님 반갑습니다.`}</button>
                        <button onClick={handleLogout} className="rounded-md p-1 pl-3 pr-3  bg-[#0BAEB3] text-white">로그아웃</button>
                    </div>
                )}
            </nav>
            <main className="flex flex-col h-full justify-center items-center">
                <Outlet />
            </main>
        </div>
    )
}

export default PrivateLayout;