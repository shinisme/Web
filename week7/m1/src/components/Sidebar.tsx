import { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";

type ActiveNav = "search" | "mypage";

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

const NAV_ITEMS: { key: ActiveNav; icon: string; label: string; path: string }[] = [
  { key: "search", icon: "🔍", label: "찾기", path: "/" },
  { key: "mypage", icon: "👤", label: "마이페이지", path: "/my" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { deleteAccount } = useAuth();

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const activeKey: ActiveNav =
    location.pathname.startsWith("/my") ? "mypage" : "search";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  const withdrawMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      onClose();
      navigate("/login");
    },
  });

  return (
    <>
      <div
        className="fixed inset-0 z-20 transition-opacity duration-300"
        style={{
          background: "rgba(6,59,61,0.32)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={onClose}
      />

      <aside
        ref={sidebarRef}
        className="fixed top-12 left-0 z-30 flex flex-col justify-between"
        style={{
          width: 220,
          height: "calc(100dvh - 3rem)",
          background: COLORS.text,
          boxShadow: "4px 0 20px rgba(6,59,61,0.2)",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <nav className="flex flex-col gap-1 px-2 py-5">
          {NAV_ITEMS.map(({ key, icon, label, path }) => {
            const isActive = activeKey === key;

            return (
              <button
                key={key}
                onClick={() => {
                  navigate(path);
                  onClose();
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
                style={{
                  background: isActive ? COLORS.soft : "transparent",
                  color: isActive ? COLORS.text : "rgba(244,255,252,0.78)",
                  fontWeight: isActive ? 700 : 400,
                  border: isActive ? `1px solid ${COLORS.border}` : "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(14,207,211,0.12)";
                    (e.currentTarget as HTMLElement).style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "rgba(244,255,252,0.78)";
                  }
                }}
              >
                <span className="text-base">{icon}</span>
                <span>{label}</span>
                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: COLORS.main }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-2 py-5">
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
            style={{
              color: "rgba(248,113,113,0.9)",
              background: "transparent",
              border: "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.14)";
              (e.currentTarget as HTMLElement).style.color = "#fecaca";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(248,113,113,0.24)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "rgba(248,113,113,0.9)";
              (e.currentTarget as HTMLElement).style.borderColor = "transparent";
            }}
          >
            <span className="text-base">🚪</span>
            <span>탈퇴하기</span>
          </button>
        </div>
      </aside>

      {showWithdrawModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(6,59,61,0.45)" }}
        >
          <div
            className="rounded-2xl p-7 w-80 flex flex-col gap-5"
            style={{
              background: "white",
              boxShadow: "0 20px 60px rgba(6,59,61,0.18)",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div className="text-center">
              <span className="text-3xl">⚠️</span>
              <h2 className="text-base font-bold mt-3" style={{ color: COLORS.text }}>
                정말 탈퇴하시겠습니까?
              </h2>
              <p className="text-xs mt-2" style={{ color: COLORS.faint }}>
                탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
              </p>
            </div>

            {withdrawMutation.isError && (
              <p className="text-xs text-center" style={{ color: "#ef4444" }}>
                탈퇴 처리 중 오류가 발생했습니다.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                style={{
                  color: COLORS.muted,
                  borderColor: COLORS.border,
                  background: "white",
                }}
              >
                아니오
              </button>

              <button
                onClick={() => withdrawMutation.mutate()}
                disabled={withdrawMutation.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{
                  background: withdrawMutation.isPending ? COLORS.faint : "#ef4444",
                }}
              >
                {withdrawMutation.isPending ? "탈퇴 중..." : "예"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}