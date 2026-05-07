import axios from "axios";
import type { ReqSignInDto, ReqSignUpDto, ResMyInfoDto, ResSignInDto, ResSignUpDto } from "../types/auth";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { LOCAL_STORAGE_KEY } from "../constants/key";

export const postSignup = async (body: ReqSignUpDto):Promise<ResSignUpDto> => {
    const { data } = await axios.post(`${import.meta.env.VITE_SERVER_API_URL}/v1/auth/signup`, body);
    return data;
}

export const postSignin = async (body: ReqSignInDto):Promise<ResSignInDto> => {
    const { data } = await axios.post(`${import.meta.env.VITE_SERVER_API_URL}/v1/auth/signin`, body);
    return data;
}

export const getMyInfo = async ():Promise<ResMyInfoDto> => {
    const { getItem } = useLocalStorage(LOCAL_STORAGE_KEY.ACCESS_TOKEN);
    const { data } = await axios.get(`${import.meta.env.VITE_SERVER_API_URL}/v1/users/me`, {
        headers: {
            Authorization: `Bearer ${getItem()}`,
        }
    });
    return data;
}

export const postLogout = async () => {
    const {data} = await axios.post(`${import.meta.env.VITE_SERVER_API_URL}/v1/auth/signout`);
    return data;
}

/*로그인 버튼 누름
→ postLogin 실행
→ 서버에 이메일/비밀번호 보냄
→ 토큰 받아옴*/