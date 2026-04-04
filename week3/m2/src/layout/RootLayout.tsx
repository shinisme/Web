import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const RootLayout = () => {
  return (
    <>
      {/* 모든 페이지에 공통으로 적용되는 Navbar */}
      <Navbar />
      {/* 현재 라우트에 해당하는 페이지가 여기에 렌더링됨 */}
      <Outlet />
    </>
  );
};

export default RootLayout;