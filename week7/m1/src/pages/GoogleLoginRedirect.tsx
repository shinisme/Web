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
            setRefreshToken(refreshToken);
            window.location.href = "/my";
        }
    }, [setAccessToken, setRefreshToken]);
    return (
        <div>
            구글 로그인 리다이렉트 페이지
        </div>
    );
}
export default GoogleLoginRedirect;