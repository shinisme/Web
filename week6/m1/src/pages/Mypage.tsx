import { useEffect, useState } from "react";
import { getMyInfo } from "../apis/auth";
import type { ResMyInfoDto } from "../types/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Mypage = () => {

    const navigate = useNavigate();
    const {logout} = useAuth();

    const [data, setData] = useState<ResMyInfoDto | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await getMyInfo();
                setData(response);
            } catch (error) {
                const message = error instanceof Error ? error.message : "내 정보를 불러오지 못했습니다.";
                setError(message);
            }
        };

        getData();
    }, []);

    const handleLogout = async() => {
        await logout();
        navigate('/');
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!data) {
        return <div>내 정보를 불러오는 중입니다.</div>;
    }

    const user = data.data;

    return (
        <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold text-[#063B3D]">{user.name}님 환영합니다</h1>
            {user.avatar && <img src={user.avatar} alt={`${user.name} 프로필`} className="w-24 h-24 rounded-full" />}
            <h1 className="text-[#063B3D]">{user.email}</h1>

            <button className="cursor-pointer bg-[#0ECFD3] text-[#063B3D] rounded-sm p-3 hover:scale-90 font-bold" onClick={handleLogout}>로그아웃</button>
        </div>
    );
};

export default Mypage;