import useForm from "../hooks/useForm";
import { validateSignin, type UserSigninInfo } from "../utils/validate";
import googleLogo from "../imgs/google.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

export default function Login() {
  const navigate = useNavigate();

  const { login, isAuthenticated } = useAuth();

  const { values, errors, touched, getInputProps } = useForm<UserSigninInfo>({
    init_val: {
      email: "",
      password: "",
    },
    validate: validateSignin,
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [navigate, isAuthenticated]);

  const loginMutation = useMutation({
    mutationFn: () => login(values),
    onSuccess: () => {
      navigate("/");
    },
    onError: (err) => {
      console.error("Login failed:", err);
    },
  });

  const handleSubmit = () => {
    loginMutation.mutate();
  };

  const handleGoogleLogin = () => {
    window.location.href =
      import.meta.env.VITE_SERVER_API_URL + "/v1/auth/google/login";
  };

  const isDisabled =
    Object.values(errors || {}).some((err) => err) ||
    !values.email ||
    !values.password ||
    loginMutation.isPending;

  return (
    <div className="flex flex-col justify-center items-center h-full gap-4">
      <div className="text-xl mb-10 font-bold flex justify-center items-center relative w-[400px] bg-white border border-[#B7EDEA] rounded-sm h-[50px] text-[#063B3D]">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-1 p-2 text-[#063B3D]"
        >
          <ChevronLeft />
        </button>
        <h1>로그인</h1>
      </div>

      <div className="w-[400px] flex flex-col gap-4">
        <button
          onClick={handleGoogleLogin}
          className="border border-[#B7EDEA] rounded-sm w-full h-[50px] relative flex justify-center items-center mb-2 bg-white hover:bg-[#E6FCFA] text-[#063B3D]"
        >
          <div className="w-[40px] h-[40px] absolute left-4">
            <img src={googleLogo} className="w-full h-full object-contain" />
          </div>
          <div>구글 로그인</div>
        </button>

        <div className="flex w-full items-center justify-center text-[#5B8C8E]">
          <hr className="w-[50%] border-[#B7EDEA]" />
          <h2 className="p-4">OR</h2>
          <hr className="w-[50%] border-[#B7EDEA]" />
        </div>

        <div className="flex flex-col gap-4">
          <input
            {...getInputProps("email")}
            className="border border-[#B7EDEA] rounded-sm w-full focus:border-[#0ECFD3] outline-none p-[8px] text-[#063B3D]"
            placeholder="이메일"
            type="email"
          />
          {errors?.email && touched?.email && (
            <div className="text-red-400 left font-bold">{errors.email}</div>
          )}

          <input
            {...getInputProps("password")}
            className="border border-[#B7EDEA] rounded-sm w-full focus:border-[#0ECFD3] outline-none p-[8px] text-[#063B3D]"
            placeholder="Password"
            type="password"
          />
          {errors?.password && touched?.password && (
            <div className="text-red-400 left font-bold">
              {errors.password}
            </div>
          )}
        </div>

        {loginMutation.isError && (
          <div className="text-red-400 font-bold text-sm">
            이메일 또는 비밀번호가 올바르지 않습니다.
          </div>
        )}

        <button
          className="rounded-sm w-full h-[50px] bg-[#0ECFD3] text-[#063B3D] mt-4 disabled:bg-[#B7EDEA] font-bold"
          onClick={handleSubmit}
          disabled={isDisabled}
        >
          {loginMutation.isPending ? "로그인 중..." : "로그인"}
        </button>
      </div>
    </div>
  );
}