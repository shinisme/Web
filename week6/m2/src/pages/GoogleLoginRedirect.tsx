/*구글 로그인 성공 후 돌아온 주소에서
accessToken, refreshToken을 꺼냄
→ localStorage에 저장
→ /my로 이동*/
import { LOCAL_STORAGE_KEY } from "../constants/key";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useEffect } from "react";

const GoogleLoginRedirect = () => {
    const {setItem: setAccessToken} = useLocalStorage(LOCAL_STORAGE_KEY.ACCESS_TOKEN);
    const {setItem: setRefreshToken} = useLocalStorage(LOCAL_STORAGE_KEY.REFRESH_TOKEN);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("accessToken");
        const refreshToken = urlParams.get("refreshToken");

        if (accessToken) {
            setAccessToken(accessToken);
            if (refreshToken) {
                setRefreshToken(refreshToken);
            }
            window.location.replace("/my");
        }
    }, [setAccessToken, setRefreshToken]);
    return (
        <div>
            구글 로그인 처리 중입니다...
        </div>
    );
}
export default GoogleLoginRedirect;