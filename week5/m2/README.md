# Week5 Mission2

## Refresh Token을 활용한 로그인 유지

이번 미션에서는 accessToken과 refreshToken을 활용하여 로그인 상태를 유지하는 구조를 구현했다.

## 구현 내용

- 로그인 성공 시 accessToken과 refreshToken을 localStorage에 저장
- AuthContext를 통해 로그인 상태를 전역으로 관리
- axios interceptor를 사용하여 요청 시 accessToken 자동 첨부
- accessToken 만료로 401 에러 발생 시 refreshToken으로 토큰 재발급
- 재발급 성공 시 기존 요청 재시도
- refreshToken 만료 또는 재발급 실패 시 토큰 삭제 후 로그인 페이지로 이동
- PrivateLayout을 통해 로그인하지 않은 사용자의 보호 페이지 접근 제한

## 확인 방법

- 로그인 후 localStorage에 accessToken, refreshToken 저장 확인
- 새로고침 후에도 로그인 상태 유지 확인
- 로그아웃 시 토큰 삭제 확인