import useForm from "../hooks/useForm";
import { validateSignin, type UserSigninInfo } from "../utils/validate";
import googleLogo from "../imgs/google.png"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Login () {
    // 이전 페이지로 부드럽게 이동하기 위해 필요
    const navigate = useNavigate();
    
    const {login, accessToken} = useAuth();
    const {values, errors, touched, getInputProps} = useForm<UserSigninInfo>({
        init_val: {
            email: "",
            password: ""
        }, 
        validate: validateSignin
    });

    useEffect(() => {
        if (accessToken) {
            navigate("/");
        }
    }, [navigate, accessToken]);

    const handleSubmit = async () => {
        await login(values);
        navigate("/my");
    }

    const handleGoogleLogin = () => {
        window.location.href = import.meta.env.VITE_SERVER_API_URL + "/v1/auth/google/login";
    }

    // 오류가 하나라도 있거나, 입력값이 비어있다면 버튼 비활성화
    const isDisabled = Object.values(errors || {}).some((err) => err) || !values.email || !values.password;

    return (<>
        <div className="flex flex-col justify-center items-center h-full gap-3">
            <div className="text-xl mb-10 font-bold flex justify-center items-center relative w-[400px]">
                <button 
                    onClick={handleSubmit}
                    className="absolute left-1"
                    >
                    {"<"}
                </button>
                <h1>로그인</h1>
            </div>
            <button
                onClick={handleGoogleLogin}
                className="border rounded-sm w-[400px] h-[50px] relative flex justify-center items-center"
                >
                <div className="w-[40px] h-[40px] absolute left-4">
                    <img src={googleLogo} className="w-full h-full object-contain"/>
                </div>
                <div>구글 로그인</div>
            </button>
            <div className="flex w-[400px] items-center justify-center">
                <hr className="w-[50%]"/>
                <h2 className="p-4">OR</h2>
                <hr className="w-[50%]"/>
            </div>
            <div className="flex flex-col gap-4">
                <input 
                    {...getInputProps("email")}
                    className="border border-[#ccccccc8] rounded-sm w-[400px] focus:border-[#0879ea] p-[8px]"
                    placeholder="이메일"
                    type="email"
                />
                {errors?.email && touched?.email && (<div className="text-red-400 left font-bold">{errors.email}</div>)}
                <input 
                    {...getInputProps("password")}
                    className="border border-[#ccccccc8] rounded-sm w-[400px] focus:border-[#0879ea] p-[8px]"
                    placeholder="Password"
                    type="password"
                />
                {errors?.password && touched?.password && (<div className="text-red-400 left font-bold">{errors.password}</div>)}
            </div>
            <button 
                className="rounded-sm w-[400px] h-[50px] bg-[#51a4f7] text-white disabled:bg-gray-600"
                onClick={handleSubmit}
                disabled={isDisabled}
                >
                로그인
            </button>
        </div>
    </>);
}