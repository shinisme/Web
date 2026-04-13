import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from './layout/RootLayout'
import HomePage from './pages/HomePage'
import MovieListPage from './pages/MovieListPage'

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
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
