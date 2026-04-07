// src/utils.ts

// 1. 현재 주소를 가져오는 함수
export const getCurrentPath = () => window.location.pathname;

// 2. 주소를 바꾸고 "바뀌었다!"고 소문내는 함수
export const navigateTo = (to: string) => {
  // 브라우저 주소창만 바꿈 (새로고침 X)
  window.history.pushState({}, '', to);
  
  // "주소가 바뀌었다"는 가짜 이벤트를 발생시켜서 React가 알게 함
  const navigationEvent = new CustomEvent('pushstate');
  window.dispatchEvent(navigationEvent);
};