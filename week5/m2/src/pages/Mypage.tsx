import { useEffect, useState } from "react"
import { getMyInfo } from "../apis/auth";
import { useAuth } from "../context/AuthContext";
import type { ResMyInfoDto } from "../types/auth";
import { useNavigate } from "react-router";

export default function MyPage() {
    const navigate = useNavigate();
    const {logout} = useAuth();
    const [data, setData] = useState<ResMyInfoDto>({} as ResMyInfoDto);

    useEffect(() => {
        const myData = async () => {
            const response = await getMyInfo();
            console.log(response);
        }

        myData();
    }, []); // 첫 마운트 시점에만 실행되도록

    const handleLogout = async () => {
        await logout();
        navigate("/");
    }

    return <>
        <h1>마이 페이지</h1>
        <h1>{data.data?.name}</h1>
        <img src={data.data?.avatar as string} alt="구글 로고" />
        <h1>{data.data?.email}</h1> 
        <button onClick={handleLogout}>로그아웃</button>
    </>
}