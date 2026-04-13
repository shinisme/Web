import type { ComponentType } from 'react';

interface RouteProps {
  component: ComponentType;
}

export const Route = ({ component: Component }: RouteProps) => {
  return <Component />;
};