import { NavLink } from 'react-router-dom';

const Navbar = () => {
  // NavLink는 현재 경로와 일치하면 자동으로 active 클래스를 추가해줌
  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'text-green-400 font-bold' : 'text-neutral-300 hover:text-white';

  return (
    <nav className="px-8 py-4 flex gap-6">
      <NavLink to="/" end className={linkStyle}>홈</NavLink>
      <NavLink to="/popular" className={linkStyle}>인기 영화</NavLink>
      <NavLink to="/upcoming" className={linkStyle}>개봉 예정</NavLink>
      <NavLink to="/top-rated" className={linkStyle}>평점 높은</NavLink>
      <NavLink to="/now-playing" className={linkStyle}>상영 중</NavLink>
    </nav>
  );
};

export default Navbar;