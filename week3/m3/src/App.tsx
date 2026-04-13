import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from './layout/RootLayout'
import HomePage from './pages/HomePage'
import MovieListPage from './pages/MovieListPage'
import MovieDetailPage from './pages/MovieDetailPage' // 새로 만들 페이지

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'popular', element: <MovieListPage category="popular" /> },
      { path: 'upcoming', element: <MovieListPage category="upcoming" /> },
      { path: 'top-rated', element: <MovieListPage category="top_rated" /> },
      { path: 'now-playing', element: <MovieListPage category="now_playing" /> },
      // 미션 3: 동적 라우팅 설정
      { path: 'movies/:movieId', element: <MovieDetailPage /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App