// src/Routes.tsx
import React, { Children, isValidElement, type ReactNode } from 'react';
import { useCurrentPath } from './hooks';
import { Route } from './Route';

interface RoutesProps {
  children: ReactNode;
}

export const Routes = ({ children }: RoutesProps) => {
  const currentPath = useCurrentPath();

  // 1. 자식 컴포넌트들 중 유효한 React 엘리먼트만 추립니다.
  const routes = Children.toArray(children).filter((child) =>
    isValidElement(child) && child.type === Route
  );

  // 2. 현재 주소(currentPath)와 Route의 path가 일치하는 것을 찾습니다.
  const activeRoute = routes.find(
    (route: any) => route.props.path === currentPath
  );

  // 3. 일치하는 게 있으면 보여주고, 없으면 null을 반환합니다.
  return activeRoute ? (activeRoute as React.ReactElement) : null;
};