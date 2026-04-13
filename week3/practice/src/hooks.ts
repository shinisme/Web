// src/hooks.ts
import { useState, useEffect } from 'react';
import { getCurrentPath } from './utils';

export const useCurrentPath = () => {
  const [path, setPath] = useState(getCurrentPath());

  useEffect(() => {
    const handleLocationChange = () => {
      setPath(getCurrentPath());
    };

    // 우리가 만든 'pushstate' 이벤트와 브라우저의 'popstate'(뒤로가기)를 모두 감시
    window.addEventListener('pushstate', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('pushstate', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  return path;
};