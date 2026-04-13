import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-14">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-900 to-emerald-950 p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <p className="text-emerald-300/90 text-sm font-semibold tracking-wide">
          WEEK3 · M3
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          영화 목록 앱
        </h1>
        <p className="mt-3 max-w-xl text-neutral-300">
          지금 보고 싶은 카테고리를 골라 빠르게 탐색해보세요.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/popular"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 active:bg-emerald-500/90"
          >
            인기 영화
          </Link>
          <Link
            to="/now-playing"
            className="rounded-xl bg-neutral-800 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 active:bg-neutral-800/90"
          >
            상영 중
          </Link>
          <Link
            to="/top-rated"
            className="rounded-xl bg-neutral-800 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 active:bg-neutral-800/90"
          >
            평점 높은
          </Link>
          <Link
            to="/upcoming"
            className="rounded-xl bg-neutral-800 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 active:bg-neutral-800/90"
          >
            개봉 예정
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
          <p className="text-sm font-semibold text-neutral-200">팁</p>
          <p className="mt-2 text-sm text-neutral-400">
            상단 네비게이션에서도 카테고리 이동이 가능해요.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
          <p className="text-sm font-semibold text-neutral-200">미션</p>
          <p className="mt-2 text-sm text-neutral-400">
            목록에서 영화를 눌러 상세 페이지로 이동해보세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;