/*
로그인 안 한 사람이 /mypage 들어가려고 함
→ 막음
→ /login으로 보냄
*/
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

const PrivateLayout = () => {
    const {accessToken} = useAuth();

    if (!accessToken) {
        return <Navigate to={"/login"} replace />; // 뒤로 가기 했을 때 history에 로그인 페이지가 남지 않도록 replace 옵션 사용
    }
    return <Outlet />;
}

export default PrivateLayout;
