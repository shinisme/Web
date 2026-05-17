import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  deleteLpApi,
  toggleLike,
  postComment,
  updateComment,
  deleteComment,
} from "../apis/lp";
import { LOCAL_STORAGE_KEY } from "../constants/key";
import axios from "axios";

const COLORS = {
  bg: "#F4FFFC",
  soft: "#E9FFFC",
  main: "#0ECFD3",
  dark: "#0BAEB3",
  text: "#063B3D",
  border: "#B8F3EE",
  muted: "#5B8C8E",
  faint: "#7AA6A8",
};

const getAuthHeader = () => {
  try {
    const token = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY.ACCESS_TOKEN) ?? "null"
    );
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

interface Tag { id: number; name: string; }
interface Likes { id: number; userId: number; }
interface Lp {
  id: number; title: string; content: string; thumbnail: string;
  published: boolean; authorId: number; createdAt: Date; updatedAt: Date;
  tags: Tag[]; likes: Likes[];
}
interface Comment {
  id: number; content: string; authorId: number;
  author: { name: string };
  createdAt: Date;
}
interface CommentPage {
  data: Comment[];
  nextCursor: number | null;
}

type CommentOrder = "newest" | "oldest";

const fetchLpDetail = async (lpId: string): Promise<Lp> => {
  const { data } = await axios.get(`${import.meta.env.VITE_SERVER_API_URL}/v1/lps/${lpId}`);
  const lp = data?.data ?? data;
  if (!lp) throw new Error("LP 데이터가 없습니다.");
  return lp;
};

const fetchComments = async (
  lpId: string,
  order: CommentOrder,
  cursor?: number
): Promise<CommentPage> => {
  const params = new URLSearchParams({
    order: order === "newest" ? "desc" : "asc",
    limit: "10",
  });
  if (cursor) params.append("cursor", String(cursor));

  const { data } = await axios.get(
    `${import.meta.env.VITE_SERVER_API_URL}/v1/lps/${lpId}/comments?${params}`,
    { headers: getAuthHeader() }
  );

  return {
    data: data?.data?.data ?? data?.data ?? [],
    nextCursor: data?.data?.nextCursor ?? null,
  };
};

const DetailSkeleton = () => (
  <div className="animate-pulse w-full px-10 py-10 space-y-6">
    <div className="h-6 w-24 rounded-lg" style={{ background: COLORS.border }} />
    <div className="w-full rounded-2xl" style={{ aspectRatio: "16/9", background: COLORS.border }} />
    <div className="h-8 w-3/4 rounded-lg" style={{ background: COLORS.border }} />
    <div className="h-4 w-40 rounded" style={{ background: "#D9FBF7" }} />
  </div>
);

const CommentSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="animate-pulse rounded-2xl p-4 space-y-2" style={{ background: COLORS.bg }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full" style={{ background: COLORS.border }} />
          <div className="h-3 w-24 rounded" style={{ background: COLORS.border }} />
          <div className="h-3 w-16 rounded ml-auto" style={{ background: "#D9FBF7" }} />
        </div>
        <div className="h-3 rounded" style={{ background: "#D9FBF7", width: `${70 + i * 10}%` }} />
      </div>
    ))}
  </div>
);

const DetailError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center w-full h-full gap-4">
    <span className="text-4xl opacity-40">💿</span>
    <p className="text-sm" style={{ color: COLORS.muted }}>데이터를 불러오지 못했습니다.</p>
    <button
      onClick={onRetry}
      className="px-5 py-2 rounded-xl text-sm font-semibold"
      style={{ background: COLORS.main, color: COLORS.text }}
    >
      다시 시도
    </button>
  </div>
);

interface CommentMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const CommentMenu = ({ onEdit, onDelete }: CommentMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={menuRef} className="relative ml-auto">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 flex items-center justify-center rounded-full text-sm transition-colors"
        style={{ color: COLORS.faint, background: "transparent" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = COLORS.soft)}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
        aria-label="댓글 메뉴"
      >
        •••
      </button>

      {open && (
        <div
          className="absolute right-0 top-8 z-10 rounded-xl overflow-hidden"
          style={{
            background: "white",
            boxShadow: "0 4px 20px rgba(6,59,61,0.12)",
            minWidth: 100,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <button
            onClick={() => { onEdit(); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors"
            style={{ color: COLORS.text }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = COLORS.soft)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            수정
          </button>
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors"
            style={{ color: "#ef4444" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#fff1f2")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
};

export default function LpDetailPage() {
  const { lpId } = useParams<{ lpId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId: currentUserId } = useAuth();

  const [commentOrder, setCommentOrder] = useState<CommentOrder>("newest");
  const [commentInput, setCommentInput] = useState("");
  const [commentError, setCommentError] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const commentBottomRef = useRef<HTMLDivElement>(null);

  const { data: lp, isLoading, isError, refetch } = useQuery<Lp>({
    queryKey: ["lp", lpId],
    queryFn: () => fetchLpDetail(lpId!),
    enabled: !!lpId,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });

  const {
    data: commentData,
    isLoading: isCommentLoading,
    isFetchingNextPage: isCommentFetchingNext,
    fetchNextPage: fetchNextComments,
    hasNextPage: hasNextComments,
  } = useInfiniteQuery<CommentPage>({
    queryKey: ["lpComments", lpId, commentOrder],
    queryFn: ({ pageParam }) =>
      fetchComments(lpId!, commentOrder, pageParam as number | undefined),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled: !!lpId,
    staleTime: 1000 * 30,
  });

  const comments = commentData?.pages.flatMap((p) => p.data) ?? [];

  const handleCommentObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextComments && !isCommentFetchingNext) {
        fetchNextComments();
      }
    },
    [hasNextComments, isCommentFetchingNext, fetchNextComments]
  );

  useEffect(() => {
    const el = commentBottomRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleCommentObserver, { threshold: 0.1 });
    observer.observe(el);

    return () => observer.disconnect();
  }, [handleCommentObserver]);

  const deleteMutation = useMutation({
    mutationFn: () => deleteLpApi(Number(lpId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lps"] });
      navigate(-1);
    },
  });

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(Number(lpId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lp", lpId] }),
  });

  const commentMutation = useMutation({
    mutationFn: () =>
      postComment({ lpId: Number(lpId), content: commentInput.trim() }),
    onSuccess: () => {
      setCommentInput("");
      setCommentError("");
      queryClient.invalidateQueries({ queryKey: ["lpComments", lpId] });
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateComment({ lpId: Number(lpId), commentId, content }),
    onSuccess: () => {
      setEditingCommentId(null);
      setEditingContent("");
      queryClient.invalidateQueries({ queryKey: ["lpComments", lpId] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) =>
      deleteComment({ lpId: Number(lpId), commentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lpComments", lpId] });
    },
  });

  const handleCommentSubmit = () => {
    if (commentInput.trim().length < 1) {
      setCommentError("댓글을 입력해주세요.");
      return;
    }
    if (commentInput.trim().length > 300) {
      setCommentError("댓글은 300자 이하로 입력해주세요.");
      return;
    }
    setCommentError("");
    commentMutation.mutate();
  };

  const handleDelete = () => {
    if (window.confirm("정말 삭제하시겠습니까?")) deleteMutation.mutate();
  };

  const handleEditStart = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleEditSubmit = (commentId: number) => {
    if (!editingContent.trim()) return;
    editCommentMutation.mutate({ commentId, content: editingContent.trim() });
  };

  const handleDeleteComment = (commentId: number) => {
    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const isOwner = lp?.authorId === currentUserId;
  const isLiked = lp?.likes.some((l) => l.userId === currentUserId) ?? false;

  return (
    <div className="flex flex-col w-full h-full overflow-hidden" style={{ background: COLORS.bg }}>
      <div
        className="shrink-0 flex items-center justify-between px-6 py-3"
        style={{ borderBottom: `1px solid ${COLORS.border}`, background: "rgba(244,255,252,0.95)" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: COLORS.dark }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.text)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.dark)}
        >
          ← 목록으로
        </button>

        {isOwner && lp && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/lp/${lpId}/edit`)}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all"
              style={{ color: COLORS.dark, borderColor: COLORS.border, background: "white" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = COLORS.soft)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "white")}
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: deleteMutation.isPending ? COLORS.faint : "#ef4444" }}
            >
              {deleteMutation.isPending ? "삭제 중..." : "삭제"}
            </button>
          </div>
        )}
      </div>

      <main className="flex-1 overflow-y-auto w-full">
        {isLoading && <DetailSkeleton />}
        {isError && <DetailError onRetry={refetch} />}

        {!isLoading && !isError && lp && (
          <article className="w-full px-10 py-10">
            <div className="flex gap-10 mb-10">
              <div
                className="shrink-0 rounded-2xl overflow-hidden"
                style={{
                  width: "45%",
                  aspectRatio: "1/1",
                  boxShadow: "0 8px 32px rgba(6,59,61,0.14)",
                }}
              >
                {lp.thumbnail ? (
                  <img src={lp.thumbnail} alt={lp.title} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: `conic-gradient(from 0deg,${COLORS.text},${COLORS.main},${COLORS.border},${COLORS.text})` }}
                  >
                    <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)" }}>
                      <div className="w-8 h-8 rounded-full" style={{ background: "rgba(255,255,255,0.8)" }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between flex-1 py-2">
                <div>
                  {!lp.published && (
                    <span
                      className="inline-block mb-3 text-xs px-3 py-1 rounded-full font-semibold"
                      style={{ background: "#fef9c3", color: "#92400e" }}
                    >
                      미발행
                    </span>
                  )}

                  <h1 className="text-3xl font-bold leading-tight mb-3" style={{ color: COLORS.text }}>
                    {lp.title}
                  </h1>

                  <p className="text-sm mb-5" style={{ color: COLORS.faint }}>
                    {new Date(lp.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>

                  {lp.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {lp.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="text-xs px-3 py-1 rounded-full"
                          style={{ background: COLORS.soft, color: COLORS.dark, border: `1px solid ${COLORS.border}` }}
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-150 self-start mt-6"
                  style={{
                    background: isLiked ? "#fee2e2" : "white",
                    color: isLiked ? "#ef4444" : COLORS.faint,
                    border: `1.5px solid ${isLiked ? "#fca5a5" : COLORS.border}`,
                    boxShadow: isLiked ? "0 2px 10px rgba(239,68,68,0.15)" : "0 2px 8px rgba(6,59,61,0.08)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isLiked) (e.currentTarget as HTMLElement).style.borderColor = COLORS.main;
                  }}
                  onMouseLeave={(e) => {
                    if (!isLiked) (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                  }}
                >
                  <span>{isLiked ? "❤️" : "🤍"}</span>
                  <span>{lp.likes.length}개</span>
                </button>
              </div>
            </div>

            <div className="mb-8" style={{ borderTop: `1px solid ${COLORS.border}` }} />

            <div className="text-base leading-8 whitespace-pre-wrap mb-12" style={{ color: COLORS.text }}>
              {lp.content}
            </div>

            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold" style={{ color: COLORS.text }}>
                  댓글 <span className="text-base font-normal" style={{ color: COLORS.faint }}>{comments.length}</span>
                </h2>

                <div className="flex items-center rounded-xl overflow-hidden border" style={{ borderColor: COLORS.border }}>
                  {(["newest", "oldest"] as CommentOrder[]).map((order) => (
                    <button
                      key={order}
                      onClick={() => setCommentOrder(order)}
                      className="px-3 py-1.5 text-xs font-semibold transition-all"
                      style={{
                        background: commentOrder === order ? COLORS.main : "white",
                        color: commentOrder === order ? COLORS.text : COLORS.muted,
                      }}
                    >
                      {order === "newest" ? "최신순" : "오래된순"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6 rounded-2xl p-4" style={{ background: "white", border: `1px solid ${COLORS.border}` }}>
                <textarea
                  value={commentInput}
                  onChange={(e) => {
                    setCommentInput(e.target.value);
                    setCommentError("");
                  }}
                  placeholder="댓글을 입력하세요... (최대 300자)"
                  rows={3}
                  maxLength={300}
                  className="w-full resize-none outline-none text-sm leading-relaxed"
                  style={{ color: COLORS.text, fontFamily: "inherit" }}
                />

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    {commentError && (
                      <p className="text-xs" style={{ color: "#ef4444" }}>⚠ {commentError}</p>
                    )}
                    <span className="text-xs" style={{ color: commentInput.length > 280 ? "#ef4444" : COLORS.faint }}>
                      {commentInput.length}/300
                    </span>
                  </div>

                  <button
                    onClick={handleCommentSubmit}
                    disabled={commentMutation.isPending}
                    className="px-5 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: commentMutation.isPending ? COLORS.faint : COLORS.main,
                      color: COLORS.text,
                    }}
                  >
                    {commentMutation.isPending ? "등록 중..." : "댓글 등록"}
                  </button>
                </div>
              </div>

              {isCommentLoading && <CommentSkeleton />}

              {!isCommentLoading && (
                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <p className="text-center py-8 text-sm" style={{ color: COLORS.faint }}>
                      첫 댓글을 남겨보세요!
                    </p>
                  ) : (
                    comments.map((comment) => {
                      const isMyComment = comment.authorId === currentUserId;
                      const isEditing = editingCommentId === comment.id;

                      return (
                        <div
                          key={comment.id}
                          className="rounded-2xl p-4"
                          style={{ background: "white", border: `1px solid ${COLORS.border}` }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ background: COLORS.main, color: COLORS.text }}
                            >
                              {comment.author?.name?.[0] ?? "?"}
                            </div>

                            <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
                              {comment.author?.name ?? "익명"}
                            </span>

                            <span className="text-xs" style={{ color: COLORS.faint }}>
                              {new Date(comment.createdAt).toLocaleDateString("ko-KR", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>

                            {isMyComment && (
                              <CommentMenu
                                onEdit={() => handleEditStart(comment)}
                                onDelete={() => handleDeleteComment(comment.id)}
                              />
                            )}
                          </div>

                          {isEditing ? (
                            <div className="mt-2">
                              <textarea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                rows={2}
                                maxLength={300}
                                className="w-full resize-none outline-none text-sm leading-relaxed rounded-lg border px-3 py-2"
                                style={{ borderColor: COLORS.border, color: COLORS.text, fontFamily: "inherit" }}
                              />

                              <div className="flex gap-2 mt-2 justify-end">
                                <button
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditingContent("");
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                                  style={{ color: COLORS.muted, borderColor: COLORS.border, background: "white" }}
                                >
                                  취소
                                </button>

                                <button
                                  onClick={() => handleEditSubmit(comment.id)}
                                  disabled={editCommentMutation.isPending}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                  style={{
                                    background: editCommentMutation.isPending ? COLORS.faint : COLORS.main,
                                    color: COLORS.text,
                                  }}
                                >
                                  {editCommentMutation.isPending ? "저장 중..." : "저장"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed" style={{ color: COLORS.text }}>
                              {comment.content}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}

                  {isCommentFetchingNext && (
                    <div className="mt-2"><CommentSkeleton /></div>
                  )}

                  <div ref={commentBottomRef} className="h-2" />

                  {!hasNextComments && comments.length > 0 && (
                    <p className="text-center text-xs py-4" style={{ color: COLORS.faint }}>
                      모든 댓글을 불러왔습니다
                    </p>
                  )}
                </div>
              )}
            </section>
          </article>
        )}
      </main>
    </div>
  );
}