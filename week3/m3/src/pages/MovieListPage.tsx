import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// 영화 데이터 타입
type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
};

// 카테고리를 props로 받아 하나의 컴포넌트로 재사용
type Props = {
  category: string; // 'popular' | 'upcoming' | 'top_rated' | 'now_playing'
};

const API_KEY = '199308621bd95ded352502e9d716d697';

const MovieListPage = ({ category }: Props) => {
  const navigate = useNavigate(); // 1. 이미 선언된 navigate 사용
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 상태
  const [page, setPage] = useState(1); // 현재 페이지 번호

  // category 또는 page가 바뀔 때마다 API 재호출
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      setError(null); // 새 요청 시 에러 초기화

      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${category}?api_key=${API_KEY}&language=ko-KR&page=${page}`
        );
        const data = await res.json();
        if (!res.ok) {
          setError(
            typeof data.status_message === 'string'
              ? data.status_message
              : '영화 데이터를 불러오는 데 실패했습니다.'
          );
          setMovies([]);
          return;
        }
        setMovies(Array.isArray(data.results) ? data.results : []);
      } catch {
        // 네트워크 에러 등 예외 처리
        setError('영화 데이터를 불러오는 데 실패했습니다.');
      } finally {
        // 성공/실패 관계없이 로딩 종료
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [category, page]);

  // 로딩 중일 때 스피너 표시
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 에러 발생 시 에러 메시지 표시
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen">
      {/* 반응형 그리드 레이아웃 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((movie) => (
          // group: 부모 hover 상태를 자식에게 전달
          <div key={movie.id} className="relative group cursor-pointer overflow-hidden rounded-lg" onClick={() => navigate(`/movies/${movie.id}`)}> // 2. 클릭 이벤트 추가
            {/* 호버 시 blur 처리 */}
          
            <img
              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-full object-cover transition-all duration-300 group-hover:blur-sm"
            />
            {/* 호버 시 제목 + 줄거리 오버레이 (평소 투명 → 호버 시 불투명) */}
            <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60">
              <p className="text-white font-bold text-sm">{movie.title}</p>
              <p className="text-gray-300 text-xs mt-1 line-clamp-3">{movie.overview}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center items-center gap-4 mt-8">
        {/* 1페이지면 이전 버튼 비활성화 */}
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-30"
        >
          이전
        </button>
        <span className="text-white">{page} 페이지</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-700 text-white rounded"
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default MovieListPage;