import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import type { MovieDetail, MovieCredits } from "../types/movie";
import { LoadingSpinner } from "../components/LoadingSpinner";

const MovieDetailPage = () => {
  const { movieId } = useParams<{ movieId: string }>();
  
  const [detail, setDetail] = useState<MovieDetail | null>(null);
  const [credits, setCredits] = useState<MovieCredits | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      setIsPending(true);
      setIsError(false);

      try {
        const [detailRes, creditsRes] = await Promise.all([
          axios.get<MovieDetail>(
            `https://api.themoviedb.org/3/movie/${movieId}?language=ko-KR`,
            { headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_KEY}` } }
          ),
          axios.get<MovieCredits>(
            `https://api.themoviedb.org/3/movie/${movieId}/credits?language=ko-KR`,
            { headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_KEY}` } }
          ),
        ]);

        setDetail(detailRes.data);
        setCredits(creditsRes.data);
      } catch (error) {
        console.error(error);
        setIsError(true);
      } finally {
        setIsPending(false);
      }
    };

    fetchMovieData();
  }, [movieId]);

  if (isPending) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  if (isError || !detail) return <div className="text-red-500 text-center mt-10">데이터를 불러오지 못했습니다. 😭</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex flex-col md:flex-row gap-10 items-start">
        <img 
          src={`https://image.tmdb.org/t/p/w500${detail.poster_path}`} 
          alt={detail.title}
          className="w-80 rounded-2xl shadow-2xl"
        />
        <div className="flex-1">
          <h1 className="text-5xl font-bold mb-4">{detail.title}</h1>
          <p className="text-xl text-yellow-400 mb-2">평점: {detail.vote_average.toFixed(1)}</p>
          <p className="text-gray-400 mb-6">{detail.release_date} • {detail.runtime}분</p>
          <p className="text-lg leading-relaxed">{detail.overview}</p>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-8">출연진</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-6">
          {credits?.cast.slice(0, 10).map((person) => (
            <div key={person.id} className="text-center">
              <img 
                src={person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : 'https://via.placeholder.com/200x300?text=No+Image'} 
                alt={person.name}
                className="w-full rounded-full aspect-square object-cover mb-2 border-2 border-gray-700"
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