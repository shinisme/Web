import './App.css'
import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import Home from './pages/Home'
import NotFoundErr from './pages/NotFoundErr'
import Login from './pages/Login'
import HomeLayout from './layouts/HomeLayout'
import SignUp from './pages/SignUp'
import MyPage from './pages/Mypage'
import { AuthProvider } from './context/AuthContext'
import PrivateLayout from './layouts/PrivateLayout'
import GoogleLoginRedirect from './pages/GoogleLoginRedirect'

const publicRoutes:RouteObject[] = [
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <NotFoundErr />,
    children: [
      {index: true, element: <Home />},
      {path: 'login', element: <Login />},
      {path: 'signup', element: <SignUp />},
      {path: '/v1/auth/google/callback', element: <GoogleLoginRedirect />}, //추가
    ]
  },
];

const privateRoutes:RouteObject[] = [
  {
    path: "/",
    element: <PrivateLayout />,
    errorElement: <NotFoundErr />,
    children: [
      {path: 'my', element: <MyPage />},
    ],
  },
];

const router = createBrowserRouter([
  ...publicRoutes,
  ...privateRoutes,
])

function App() {
  return (
    <>
      <AuthProvider>
        <RouterProvider router={router}/>
      </AuthProvider>
    </>
  )
}

export default App