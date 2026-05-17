/*
useLocalStorage
→ localStorage 저장/조회/삭제 쉽게 해주는 훅
새로고침해도 남아 있음
브라우저 꺼도 남아 있음
로그인 토큰 저장할 때 자주 씀
*/

export const useLocalStorage = (key: string) => {
  // key 이름을 받아서 해당하는 localStorage 조작하는 함수들 만들어줌

  const setItem = (value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // localStorage는 문자열만 저장할 수 있어서 JSON.stringify로 감싸서 저장
    } catch (err) {
      console.log(err);
    }
  };

  const getItem = () => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
      // 저장할 때 JSON.stringify로 감싸줬으니까 꺼낼 때는 JSON.parse로 다시 객체로 만들어주기
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  const removeItem = () => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.log(err);
    }
  };
  // localStorage에서 해당 key 삭제

  return { setItem, getItem, removeItem };
};