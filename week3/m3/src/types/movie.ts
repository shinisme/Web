export type Movie = {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};

export interface MovieCredits {
  cast: Cast[];
};

export interface MovieDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  tagline: string;
  runtime: number;
  genres: { id: number; name: string }[];
}

export type MovieResponse = {
  page: number;
  results: Movie[];