import { useState } from "react";
import { z } from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSignup } from "../apis/auth";
import googleLogo from "../imgs/google.png";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ChevronLeft, Camera } from "lucide-react";

// Schema 정의
const schema = z.object({
    email: z.string().email({ message: "올바른 이메일 형식이 아닙니다!" }),
    password: z
        .string()
        .min(8, { message: "비밀번호는 8자 이상이어야 합니다!" })
        .max(20, { message: "비밀번호는 20자 이하여야 합니다!" }),
    passwordCheck: z.string(),
    name: z
        .string()
        .min(2, { message: "닉네임은 2자 이상이어야 합니다." })
        .max(10, { message: "닉네임은 10자 이하로 설정해주세요." })
}).refine((data) => data.password === data.passwordCheck, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordCheck"]
});

type FormFields = z.infer<typeof schema>;

export default function SignUp() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [showPw, setShowPw] = useState(false);
    const [showPwCheck, setShowPwCheck] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, trigger, watch, formState: { errors, isSubmitting, isValid } } = useForm<FormFields>({
        mode: "onChange",
        defaultValues: { email: "", password: "", passwordCheck: "", name: "" },
        resolver: zodResolver(schema),
    });

    const emailValue = watch("email");
    const nameValue = watch("name"); // 닉네임 값 모니터링

    // 단계별 유효성 검사 후 다음 단계로 이동
    const goNext = async (fields: (keyof FormFields)[], nextStep: 1 | 2 | 3) => {
        const isStepValid = await trigger(fields);
        if (isStepValid) setStep(nextStep);
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const { passwordCheck, ...rest } = data;
            await postSignup(rest); // rest에는 email, password, name(닉네임)이 포함됨
            alert("회원가입이 완료되었습니다!");
            navigate("/"); 
        } catch (error: any) {
            alert(error.response?.data?.message || "회원가입 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-full gap-3 py-10">
            {/* 상단 헤더 */}
            <div className="text-xl mb-10 font-bold flex justify-center items-center relative w-[400px] bg-white border border-[#B7EDEA] rounded-sm h-[50px]">
                <button 
                    onClick={() => step === 1 ? navigate(-1) : setStep((prev) => (prev - 1) as any)} 
                    className="absolute left-1 p-2 text-[#063B3D]"
                >
                    <ChevronLeft />
                </button>
                <h1 className="text-[#063B3D]">회원가입</h1>
            </div>

            <div className="w-[400px]">
                {/* STEP 1: 이메일 입력 */}
                {step === 1 && (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                        <button className="border border-[#B7EDEA] rounded-sm w-full h-[50px] relative flex justify-center items-center mb-2 bg-white hover:bg-[#E6FCFA] text-[#063B3D]">
                            <img src={googleLogo} className="w-[24px] h-[24px] absolute left-4 object-contain" alt="google" />
                            <div>구글로 시작하기</div>
                        </button>
                        <div className="flex w-[400px] items-center justify-center">
                            <hr className="w-[50%]"/>
                            <h2 className="p-4">OR</h2>
                            <hr className="w-[50%]"/>
                        </div>
                        <div className="flex flex-col gap-4">
                            <input 
                                {...register("email")} 
                                className="border border-[#ccccccc8] rounded-sm p-[12px] focus:border-[#0ECFD3] outline-none" 
                                placeholder="이메일 주소" 
                                type="email" 
                            />
                            {errors.email && <p className="text-red-400 text-sm font-bold">{errors.email.message}</p>}
                        </div>
                        <button 
                            onClick={() => goNext(["email"], 2)} 
                            className="rounded-sm h-[50px] bg-[#0ECFD3] text-[#063B3D] mt-4 disabled:bg-[#B7EDEA] font-bold"
                        >
                            다음
                        </button>
                    </div>
                )}

                {/* STEP 2: 비밀번호 설정 */}
                {step === 2 && (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                        <div className="mb-4">
                            <p className="text-gray-500 text-sm">이메일</p>
                            <p className="font-semibold text-lg text-[#063B3D]">{emailValue}</p>
                        </div>
                        <div className="relative">
                            <input {...register("password")} type={showPw ? "text" : "password"} className="border border-[#ccccccc8] rounded-sm w-full p-[12px] focus:border-[#0ECFD3] outline-none" placeholder="비밀번호 (8자 이상)" />
                            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-[14px] text-[#0BAEB3]">
                                {showPw ? <Eye size={20} /> : <EyeOff size={20}/>}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-400 text-sm font-bold">{errors.password.message}</p>}
                        
                        <div className="relative">
                            <input {...register("passwordCheck")} type={showPwCheck ? "text" : "password"} className="border border-[#ccccccc8] rounded-sm w-full p-[12px] focus:border-[#0ECFD3] outline-none" placeholder="비밀번호 재확인" />
                            <button type="button" onClick={() => setShowPwCheck(!showPwCheck)} className="absolute right-3 top-[14px] text-[#0BAEB3]">
                                {showPwCheck ? <Eye size={20} /> : <EyeOff size={20}/>}
                            </button>
                        </div>
                        {errors.passwordCheck && <p className="text-red-400 text-sm font-bold">{errors.passwordCheck.message}</p>}
                        
                        <button 
                            onClick={() => goNext(["password", "passwordCheck"], 3)} 
                            className="rounded-sm h-[50px] bg-[#0ECFD3] text-[#063B3D] mt-4 disabled:bg-[#B7EDEA] font-bold"
                        >
                            다음
                        </button>
                    </div>
                )}

                {/* STEP 3: 닉네임(name) 및 프로필 설정 */}
                {step === 3 && (
                    <div className="flex flex-col gap-6 animate-fadeIn items-center">
                        <div className="text-center w-full">
                            <h2 className="text-lg font-bold text-[#063B3D]">거의 다 왔어요!</h2>
                            <p className="text-gray-500 text-sm">사용하실 닉네임을 설정해주세요.</p>
                        </div>

                        {/* 프로필 이미지 UI (Placeholder) */}
                        <div className="relative w-32 h-32">
                            <div className="w-full h-full bg-[#E6FCFA] rounded-full flex items-center justify-center border-2 border-dashed border-[#0ECFD3] overflow-hidden">
                                <Camera className="text-[#0BAEB3]" size={32} />
                            </div>
                            <div className="absolute bottom-1 right-1 bg-[#0BAEB3] p-2 rounded-full text-white shadow-md cursor-pointer">
                                <Camera size={14} />
                            </div>
                        </div>

                        <div className="w-full flex flex-col gap-1">
                            <input 
                                {...register("name")} 
                                className="border border-[#ccccccc8] rounded-sm w-full p-[12px] focus:border-[#0ECFD3] outline-none text-center text-lg" 
                                placeholder="닉네임 입력 (2~10자)" 
                            />
                            {errors.name && <p className="text-red-400 text-sm font-bold text-center">{errors.name.message}</p>}
                        </div>

                        <button 
                            onClick={handleSubmit(onSubmit)} 
                            disabled={isSubmitting || !isValid} 
                            className="rounded-sm w-full h-[50px] bg-[#0ECFD3] text-[#063B3D] disabled:bg-[#B7EDEA] transition-all font-bold text-lg"
                        >
                            회원가입 완료
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}