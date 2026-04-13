// src/Link.tsx
import { navigateTo } from './utils';

interface LinkProps {
  to: string;
  children: React.ReactNode;
}

export const Link = ({ to, children }: LinkProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // <a> 태그의 페이지 이동 기능을 억제!
    navigateTo(to);    // 대신 우리가 만든 함수로 주소만 바꿈
  };

  return (
    <a href={to} onClick={handleClick} style={{ marginRight: '10px' }}>
      {children}
    </a>
  );
};