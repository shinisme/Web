// src/Route.tsx
import { type ReactNode } from 'react';

interface RouteProps {
  path: string;
  component: React.ComponentType;
}

// 실제로 무언가를 그리지는 않고, 정보만 전달하는 컴포넌트입니다.
export const Route = ({ component: Component }: RouteProps) => {
  return <Component />;
};