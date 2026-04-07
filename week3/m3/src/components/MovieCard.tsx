import type { Movie } from "../types/movie.ts";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. useNavigate 임포트

interface MovieCardProps {
    movie: Movie;   
}

export default function MovieCard({ movie }: MovieCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate(); // 2. 훅 선언

    return ( 
        <div 
            className='relative ... cursor-pointer'
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => navigate(`/movies/${movie.id}`)} // 3. 클릭 시 이동 경로 설정
        >
            <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={`${movie.title} 영화의 이미지`} 
            className=' '
            />
            {isHovered && <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent backdrop-blur-md flex flex-col justify-center items-center text-white p-4'>
                <h2 className='text-lg font-bold text-center leading-snug'>{movie.title}</h2>
                <p className='text-sm text-grey-300 leading-relaxed mt-2 line-clamp-5'>{movie.overview}</p>
            </div>}
        </div>
    );
} 