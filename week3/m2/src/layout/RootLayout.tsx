import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-neutral-900">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default RootLayout;