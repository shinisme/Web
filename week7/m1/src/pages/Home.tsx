import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { is } from "zod/v4/locales";
import { postLp, uploadImage } from "../apis/lp";
import type { ReqCreateLpDto } from "../types/lp";

interface Tag { id: number; name: string; }
interface Likes { id: number; userId: number; }
interface Lp {
    id: number; title: string; content: string; thumbnail: string;
    published: boolean; authorId: number; createdAt: Date; updatedAt: Date;
    tags: Tag[]; likes: Likes[];
}

interface LpPage {
    data: Lp[];
    nextCursor: number | null;
}

type SortOrder = "newest" | "oldest";

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
const fetchLps = async (sort: SortOrder, cursor?: number): Promise<LpPage> => {
    const order = sort === "newest" ? "desc" : "asc";
    const params = new URLSearchParams({ order, limit: "20" });
    if (cursor) params.append("cursor", String(cursor));

    const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_API_URL}/v1/lps?${params}`
    );

    const list: Lp[] = data?.data?.data ?? data?.data ?? data ?? [];
    const nextCursor: number | null = data?.data?.nextCursor ?? null;
    return { data: list, nextCursor };
};

// ── 스켈레톤 카드 (카드와 동일 크기) ─────────────────
const SkeletonCard = () => (
    <div
        className="rounded-2xl animate-pulse"
        style={{ aspectRatio: "1/1", background: "#dbeafe" }}
    />
);

const GridSkeleton = ({ count = 10 }: { count?: number }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
);

const GridError = ({ onRetry }: { onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 py-24">
        <span className="text-5xl opacity-30">💿</span>
        <p className="text-sm" style={{ color: "#64748b" }}>데이터를 불러오지 못했습니다.</p>
        <button
            onClick={onRetry}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "#1d4ed8" }}
        >
            다시 시도
        </button>
    </div>
);

// ── LP 카드 ────────────────────────────────────────────
const LpCard = ({ lp, onClick }: { lp: Lp; onClick: () => void }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="relative rounded-2xl overflow-hidden cursor-pointer select-none"
            style={{
                aspectRatio: "1/1",
                border: "1px solid",
                borderColor: hovered ? "#93c5fd" : "#e0e9f8",
                boxShadow: hovered ? "0 12px 32px rgba(29,78,216,0.18)" : "0 2px 8px rgba(29,78,216,0.06)",
                transform: hovered ? "translateY(-3px)" : "translateY(0)",
                transition: "all 0.22s ease",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClick}
        >
            {lp.thumbnail ? (
                <img
                    src={lp.thumbnail} alt={lp.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transform: hovered ? "scale(1.06)" : "scale(1)", transition: "transform 0.4s ease" }}
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "conic-gradient(from 0deg,#1e3a8a,#3b82f6,#bfdbfe,#1e3a8a)" }}>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                        <div className="w-5 h-5 rounded-full" style={{ background: "rgba(255,255,255,0.7)" }} />
                    </div>
                </div>
            )}

            <div
                className="absolute inset-0 flex flex-col justify-end p-4"
                style={{
                    background: hovered ? "rgba(15,23,60,0.74)" : "rgba(15,23,60,0)",
                    backdropFilter: hovered ? "blur(5px)" : "blur(0px)",
                    transition: "background 0.25s ease, backdrop-filter 0.25s ease",
                }}
            >
                {!lp.published && hovered && (
                    <span className="absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#fef9c3", color: "#92400e" }}>미발행</span>
                )}
                {hovered && (
                    <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full"
                        style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>
                        ❤️ {lp.likes.length}
                    </span>
                )}
                <div style={{
                    opacity: hovered ? 1 : 0,
                    transform: hovered ? "translateY(0)" : "translateY(8px)",
                    transition: "opacity 0.22s ease, transform 0.22s ease",
                }}>
                    <h2 className="font-bold text-white text-sm leading-snug mb-1 truncate">{lp.title}</h2>
                    <p className="text-xs leading-relaxed mb-2" style={{
                        color: "rgba(255,255,255,0.65)",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>{lp.content}</p>
                    {lp.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {lp.tags.slice(0, 3).map((tag) => (
                                <span key={tag.id} className="text-xs px-2 py-0.5 rounded-full"
                                    style={{ background: "rgba(147,197,253,0.2)", color: "#bfdbfe", border: "1px solid rgba(147,197,253,0.3)" }}>
                                    #{tag.name}
                                </span>
                            ))}
                            {lp.tags.length > 3 && (
                                <span className="text-xs px-2 py-0.5 rounded-full"
                                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
                                    +{lp.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
                        {new Date(lp.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                </div>
            </div>
        </div>
    );
};
// ── LP 작성 모달 ───────────────────────────────────────
interface CreateLpModalProps {
    onClose: () => void;
}

const CreateLpModal = ({ onClose }: CreateLpModalProps) => {
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [published, setPublished] = useState(true);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);

    const overlayRef = useRef<HTMLDivElement>(null);

    const createMutation = useMutation({
        mutationFn: async (body: ReqCreateLpDto) => postLp(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lps"] });
            onClose();
        },
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setThumbnailFile(file);
        const preview = await fileToBase64(file);
        setThumbnailPreview(preview);
    };

    const handleAddTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags((prev) => [...prev, trimmed]);
        }
        setTagInput("");
    };

    const handleRemoveTag = (tag: string) => {
        setTags((prev) => prev.filter((t) => t !== tag));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) return;

        let thumbnail: string | undefined;

        if (thumbnailFile) {
            thumbnail = await uploadImage(thumbnailFile);
        }

        createMutation.mutate({
            title: title.trim(),
            content: content.trim(),
            thumbnail,
            published,
            tags,
        });
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === overlayRef.current) onClose();
    };
    
    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick} // 모달 외부 클릭 시 닫기
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
        >
            <div
                className="relative w-full max-w-lg rounded-2xl p-7 flex flex-col gap-5"
                style={{ background: "white", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold" style={{ color: "#1e738a" }}>새 LP 추가</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors"
                        style={{ background: "#f1f5f9", color: "#64748b" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#e2e8f0")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#f1f5f9")}
                        aria-label="닫기"
                    >
                        ✕
                    </button>
                </div>

                {/* 썸네일 */}
                <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: "#475569" }}>LP 사진</label>
                    {thumbnailPreview && (
                        <img
                            src={thumbnailPreview} alt="미리보기"
                            className="w-full rounded-xl object-cover mb-2"
                            style={{ maxHeight: 180 }}
                        />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full text-sm rounded-lg border p-2"
                        style={{ borderColor: "#e0e9f8", color: "#334155" }}
                    />
                </div>

                {/* 제목 */}
                <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "#475569" }}>제목 *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="LP 제목을 입력하세요"
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                        style={{ borderColor: "#e0e9f8", color: "#1e738a" }} // 기본 테두리와 텍스트 색상
                        onFocus={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#3bf6f0")} // 포커스 시 테두리 색상 변경
                        onBlur={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#e0e9f8")}
                    />
                </div>

                {/* 내용 */}
                <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "#475569" }}>내용</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="LP에 대한 설명을 입력하세요"
                        rows={3}
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none transition-colors"
                        style={{ borderColor: "#e0e9f8", color: "#1e738a", fontFamily: "inherit" }}
                        onFocus={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#3bf6f0")}
                        onBlur={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#e0e9f8")}
                    />
                </div>

                {/* 태그 */}
                <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "#475569" }}>태그</label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            placeholder="태그 입력 후 추가 버튼 클릭"
                            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                            style={{ borderColor: "#e0e9f8", color: "#1e738a" }}
                            onFocus={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#3bf6f0")}
                            onBlur={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#e0e9f8")}
                        />
                        <button
                            onClick={handleAddTag}
                            className="px-4 py-2 rounded-lg text-xs font-semibold text-white"
                            style={{ background: "#41e5d4c3" }}
                        >
                            추가
                        </button>
                    </div>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="flex items-center gap-1 text-xs px-3 py-1 rounded-full"
                                    style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}
                                >
                                    #{tag}
                                    <button
                                        onClick={() => handleRemoveTag(tag)}
                                        className="ml-1 font-bold leading-none"
                                        style={{ color: "#94a3b8" }}
                                        aria-label={`${tag} 태그 삭제`}
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* 공개 여부 */}
                <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold" style={{ color: "#475569" }}>공개</label>
                    <button
                        onClick={() => setPublished((v) => !v)}
                        className="relative w-10 h-5 rounded-full transition-colors"
                        style={{ background: published ? "#90dce5" : "#cbd5e1" }}
                        aria-label="공개 여부"
                    >
                        <span
                            className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                            style={{ transform: published ? "translateX(-19px)" : "translateX(2px)" }} // 토글 애니메이션 translateX: 2px (off) <-> translateX(21px) (on) , tanslateX(2px)로 시작해서 19px 이동해야 하므로 21px로 설정
                        />
                    </button>
                    <span className="text-xs" style={{ color: "#94a3b8" }}>{published ? "공개" : "비공개"}</span>
                </div>

                {/* 에러 */}
                {createMutation.isError && (
                    <p className="text-xs" style={{ color: "#ef4444" }}>
                        LP 생성에 실패했습니다. 다시 시도해주세요.
                    </p>
                )}

                {/* 제출 */}
                <button
                    onClick={handleSubmit}
                    disabled={createMutation.isPending || !title.trim()}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all"
                    style={{
                        background: createMutation.isPending || !title.trim() ? "#94a3b8" : "linear-gradient(135deg,#063B3D,#3bf6f0)",
                        cursor: createMutation.isPending || !title.trim() ? "not-allowed" : "pointer",
                    }}
                >
                    {createMutation.isPending ? "저장 중..." : "Add LP"}
                </button>
            </div>
        </div>
    );
};

// ── 메인 ──────────────────────────────────────────────
export default function Home() {
    const navigate = useNavigate();
    const isLoggedIn = true; // 실제 auth 훅으로 교체

    const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false); // LP 생성 모달 상태

    // 무한스크롤 감지용 ref
    const bottomRef = useRef<HTMLDivElement>(null);

    const {
        data,
        isLoading,
        isError,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        refetch,
    } = useInfiniteQuery<LpPage>({
        queryKey: ["lps", sortOrder],
        queryFn: ({ pageParam }) => fetchLps(sortOrder, pageParam as number | undefined),
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        initialPageParam: undefined,
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 5,
    });

    // 모든 페이지 LP 평탄화
    const lpList = data?.pages.flatMap((p) => p.data) ?? [];

    const filtered = lpList.filter(
        (lp) =>
            lp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lp.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lp.tags.some((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // IntersectionObserver — 바닥 감지 시 fetchNextPage
    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        },
        [hasNextPage, isFetchingNextPage, fetchNextPage]
    );

    useEffect(() => {
        const el = bottomRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [handleObserver]);

    const handleCardClick = (lp: Lp) => {
        if (!isLoggedIn) {
            if (window.confirm("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?")) {
                navigate("/login");
            }
            return;
        }
        navigate(`/lp/${lp.id}`);
    };

    return (
        <div className="flex w-full h-full overflow-hidden" style={{ background: "#f4f7fb" }}>
            <main className="flex flex-col w-full h-full overflow-hidden">

                {/* 서브헤더: 검색 + 정렬 */}
                <div
                    className="shrink-0 flex items-center justify-between px-6 py-3 gap-4" //shrink-0: 부모의 높이에 따라 이 요소의 높이가 결정됨. 즉, 상단바 높이만큼 공간 차지하고 나머지는 아래 콘텐츠가 채움
                    style={{ background: "rgba(244,247,251,0.95)", borderBottom: "1px solid #e0e9f8" }}
                >
                    <div className="relative flex-1 max-w-sm">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#93c5fd" }}>🔍</span>
                        <input
                            type="text"
                            placeholder="제목, 내용, 태그 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none border transition-colors"
                            style={{ background: "white", borderColor: searchQuery ? "#3b82f6" : "#dbeafe", color: "#1e3a8a" }}
                        />
                    </div>

                    {/* 정렬 토글 — 변경 시 첫 페이지부터 다시 로딩 */}
                    <div className="flex items-center rounded-xl overflow-hidden border shrink-0" style={{ borderColor: "#dbeafe" }}>
                        {(["newest", "oldest"] as SortOrder[]).map((order) => (
                            <button
                                key={order}
                                onClick={() => setSortOrder(order)}
                                className="px-4 py-2 text-xs font-semibold transition-all duration-150"
                                style={{
                                    background: sortOrder === order ? "#52c5c2" : "white",
                                    color: sortOrder === order ? "white" : "#64748b",
                                }}
                            >
                                {order === "newest" ? "최신순" : "오래된순"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 결과 수 */}
                <div className="px-6 pt-4 pb-2 shrink-0">
                    <span className="text-xs" style={{ color: "#94a3b8" }}>
                        {isLoading ? "불러오는 중..." : `${filtered.length}개의 LP`}
                    </span>
                </div>

                {/* 그리드 영역 */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">

                    {/* 초기 로딩 — 상단 스켈레톤 */}
                    {isLoading && <GridSkeleton count={10} />}

                    {isError && <GridError onRetry={refetch} />}

                    {!isLoading && !isError && (
                        <>
                            {filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
                                    <span className="text-5xl">💿</span>
                                    <p className="text-sm" style={{ color: "#64748b" }}>검색 결과가 없습니다</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {filtered.map((lp) => (
                                        <LpCard key={lp.id} lp={lp} onClick={() => handleCardClick(lp)} />
                                    ))}
                                </div>
                            )}

                            {/* 추가 로딩 — 하단 스켈레톤 */}
                            {isFetchingNextPage && (
                                <div className="mt-4">
                                    <GridSkeleton count={5} />
                                </div>
                            )}

                            {/* IntersectionObserver 트리거 */}
                            <div ref={bottomRef} className="h-4" />

                            {/* 마지막 페이지 안내 */}
                            {!hasNextPage && lpList.length > 0 && (
                                <p className="text-center text-xs py-6" style={{ color: "#94a3b8" }}>
                                    모든 LP를 불러왔습니다
                                </p>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* 플로팅 + 버튼 */}
            <button
                onClick={() => setIsModalOpen(true)} // 클릭 시 모달 열기 (모달 구현은 추후)
                className="fixed bottom-8 right-8 z-30 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-light text-white"
                style={{
                    background: "linear-gradient(135deg,#0BEAB3,#063B3D)",
                    boxShadow: "0 6px 24px rgba(82, 220, 230, 0.88)", //boxshadow로 입체감 추가
                    transition: "transform 0.15s ease, box-shadow 0.15s ease", //호버 시 애니메이션 부드럽게
                }}
                onMouseEnter={(e) => { //호버 시 살짝 커지고 그림자 진하게
                    (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(82, 220, 230, 0.5)";
                }}
                onMouseLeave={(e) => { //호버 해제 시 원래 크기와 그림자로 돌아감
                    (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(82, 220, 230, 0.4)";
                }}
                aria-label="LP 추가"
            >
                +
            </button>

            {isModalOpen && <CreateLpModal onClose={() => setIsModalOpen(false)} />} {/* 모달 컴포넌트는 추후 구현 */}
        </div>
    );
}
