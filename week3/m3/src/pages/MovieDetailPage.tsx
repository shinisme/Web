import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

// 미션 3: 타입 정의
interface MovieDetails {
  title: string;
  backdrop_path: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  overview: string;
  tagline: string;
}

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

const API_KEY = '199308621bd95ded352502e9d716d697'; // 기존 API 키 사용

const MovieDetailPage = () => {
  const { movieId } = useParams<{ movieId: string }>(); // URL에서 ID 추출
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      setIsLoading(true);
      try {
        // 상세 정보와 크레딧 데이터를 동시에 요청
        const [movieRes, creditsRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=ko-KR`),
          fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}&language=ko-KR`)
        ]);

        if (!movieRes.ok || !creditsRes.ok) throw new Error('데이터를 불러오지 못했습니다.');

        const movieData = await movieRes.json();
        const creditsData = await creditsRes.json();

        setMovie(movieData);
        setCast(creditsData.cast.slice(0, 10)); // 상위 10명만 표시
      } catch (err) {
        setError('영화 정보를 불러오는 중 에러가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieData();
  }, [movieId]);

  // 로딩 및 에러 처리
  if (isLoading) return <div className="text-white text-center mt-20">로딩 중...</div>;
  if (error || !movie) return <div className="text-red-500 text-center mt-20">{error}</div>;

  return (
    <div className="text-white">
      {/* 상단 히어로 섹션 (배경 이미지 활용) */}
      <div className="relative h-[400px] w-full">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img 
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} 
          className="w-full h-full object-cover"
          alt="background"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center p-10">
          <h1 className="text-4xl font-bold">{movie.title}</h1>
          <p className="text-yellow-400 mt-2">평점: ⭐ {movie.vote_average.toFixed(1)}</p>
          <p className="mt-2 italic text-gray-300">{movie.tagline}</p>
          <p className="mt-4 max-w-2xl line-clamp-4">{movie.overview}</p>
        </div>
      </div>

      {/* 출연진 목록 */}
      <div className="p-10">
        <h2 className="text-2xl font-bold mb-6">출연진</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {cast.map((person) => (
            <div key={person.id} className="text-center">
              <img 
                src={person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : 'https://via.placeholder.com/200x300'}
                className="rounded-full w-24 h-24 mx-auto object-cover mb-2 border-2 border-gray-700"
                alt={person.name}
              />
              <p className="font-bold text-sm">{person.name}</p>
              <p className="text-xs text-gray-400">{person.character}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;