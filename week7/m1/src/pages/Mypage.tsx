import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyInfo, patchMyInfo } from "../apis/auth";
import { useAuth } from "../context/AuthContext";
import type { ReqUpdateMyInfoDto } from "../types/auth";

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

export default function MyPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { logout } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editBio, setEditBio] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["myInfo"],
        queryFn: getMyInfo,
        staleTime: 1000 * 60,
    });

    const user = data?.data;

    const updateMutation = useMutation({
        mutationFn: (body: ReqUpdateMyInfoDto) => patchMyInfo(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myInfo"] });
            setIsEditing(false);
            setAvatarFile(null);
            setAvatarPreview("");
        },
    });

    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: () => navigate("/"),
    });

    const openEdit = () => {
        setEditName(user?.name ?? "");
        setEditBio(user?.bio ?? "");
        setAvatarPreview(user?.avatar ?? "");
        setIsEditing(true);
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        const preview = await fileToBase64(file);
        setAvatarPreview(preview);
    };

    const handleSave = async () => {
        const body: ReqUpdateMyInfoDto = {};
        if (editName.trim()) body.name = editName.trim();
        if (editBio !== undefined) body.bio = editBio;
        if (avatarFile) {
            body.avatar = await fileToBase64(avatarFile);
        }
        updateMutation.mutate(body);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-pulse text-sm" style={{ color: "#94a3b8" }}>불러오는 중...</div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col w-full h-full overflow-hidden"
            style={{ background: "#F4FFFC" }}
        >
            <div
                className="shrink-0 flex items-center justify-between px-6 py-3"
                style={{
                    borderBottom: "1px solid #B8F3EE",
                    background: "rgba(244,255,252,0.95)",
                }}
            >
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-sm font-semibold transition-colors"
                    style={{ color: "#0BAEB3" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#063B3D")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#0BAEB3")}
                >
                    🏠 홈으로
                </button>
            </div>

            <main className="flex-1 overflow-y-auto flex justify-center px-6 py-10">
                <div
                    className="w-full max-w-md rounded-2xl p-8"
                    style={{
                        background: "white",
                        border: "1px solid #B8F3EE",
                        boxShadow: "0 20px 60px rgba(6,59,61,0.08)",
                    }}
                >

                    <div className="flex flex-col items-center w-full py-12 px-4" style={{ background: "#F4FFFC", minHeight: "100%" }}>
                        {/* 상단 헤더 */}
                        <div
                            className="flex items-center justify-between px-6 py-3"
                            style={{ borderBottom: "1px solid #e0e9f8", background: "rgba(244,247,251,0.95)" }}
                        >
                        </div>
                        {/* 프로필 카드 */}
                        <div
                            className="w-full max-w-md rounded-2xl p-8 flex flex-col items-center gap-6"
                            style={{ background: "white", boxShadow: "0 4px 24px rgba(29,78,216,0.08)" }}
                        >
                            {/* 아바타 */}
                            <div className="relative">
                                <div
                                    className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-3xl font-bold text-white"
                                    style={{ background: "#0ECFD3" }}
                                >
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt="프로필" className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.[0] ?? "?"
                                    )}
                                </div>
                            </div>

                            {/* 이름 */}
                            <div className="text-center">
                                <h1 className="text-xl font-bold" style={{ color: "#1e3a8a" }}>{user?.name}</h1>
                                <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>{user?.email}</p>
                                {user?.bio && (
                                    <p className="text-sm mt-2" style={{ color: "#5B8C8E" }}>{user.bio}</p>
                                )}
                            </div>

                            {/* 버튼 영역 */}
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={openEdit}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                                    style={{ color: "#063B3D", borderColor: "#bfdbfe", background: "white" }}
                                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#eff6ff")}
                                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "white")}
                                >
                                    ⚙ 설정
                                </button>
                                <button
                                    onClick={() => logoutMutation.mutate()}
                                    disabled={logoutMutation.isPending}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                                    style={{ background: logoutMutation.isPending ? "#94a3b8" : "#0BAEB3" }}
                                >
                                    {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
                                </button>
                            </div>

                            {/* 가입일 */}
                            {user?.createdAt && (
                                <p className="text-xs" style={{ color: "#cbd5e1" }}>
                                    가입일: {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                                </p>
                            )}
                        </div>

                        {/* 프로필 수정 모달 */}
                        {isEditing && (
                            <div
                                className="fixed inset-0 z-50 flex items-center justify-center"
                                style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
                                onClick={(e) => { if (e.target === e.currentTarget) setIsEditing(false); }}
                            >
                                <div
                                    className="relative w-full max-w-md rounded-2xl p-7 flex flex-col gap-5"
                                    style={{ background: "white", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
                                >
                                    {/* 헤더 */}
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold" style={{ color: "#063B3D" }}>프로필 수정</h2>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
                                            style={{ background: "#f1f5f9", color: "#5B8C8E" }}
                                            aria-label="닫기"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* 아바타 수정 */}
                                    <div className="flex flex-col items-center gap-3">
                                        <div
                                            className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold text-white cursor-pointer"
                                            style={{ background: "#0ECFD3" }}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="미리보기" className="w-full h-full object-cover" />
                                            ) : (
                                                user?.name?.[0] ?? "?"
                                            )}
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-xs font-semibold"
                                            style={{ color: "#0ECFD3" }}
                                        >
                                            사진 변경
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </div>

                                    {/* 이름 */}
                                    <div>
                                        <label className="block text-xs font-semibold mb-1" style={{ color: "#475569" }}>이름</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="이름을 입력하세요"
                                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                                            style={{ borderColor: "#e0e9f8", color: "#1e3a8a" }}
                                            onFocus={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#0ECFD3")}
                                            onBlur={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#e0e9f8")}
                                        />
                                    </div>

                                    {/* Bio */}
                                    <div>
                                        <label className="block text-xs font-semibold mb-1" style={{ color: "#475569" }}>
                                            Bio <span style={{ color: "#94a3b8", fontWeight: 400 }}>(선택)</span>
                                        </label>
                                        <textarea
                                            value={editBio}
                                            onChange={(e) => setEditBio(e.target.value)}
                                            placeholder="자기소개를 입력하세요"
                                            rows={3}
                                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none transition-colors"
                                            style={{ borderColor: "#e0e9f8", color: "#1e3a8a", fontFamily: "inherit" }}
                                            onFocus={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#0ECFD3")}
                                            onBlur={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#e0e9f8")}
                                        />
                                    </div>

                                    {updateMutation.isError && (
                                        <p className="text-xs" style={{ color: "#ef4444" }}>저장에 실패했습니다. 다시 시도해주세요.</p>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                                            style={{ color: "#5B8C8E", borderColor: "#e0e9f8", background: "white" }}
                                        >
                                            취소
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={updateMutation.isPending}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                                            style={{ background: updateMutation.isPending ? "#94a3b8" : "linear-gradient(135deg,#0BAEB3,#0ECFD3)" }}
                                        >
                                            {updateMutation.isPending ? "저장 중..." : "저장"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main >
        </div >
    );
                
}