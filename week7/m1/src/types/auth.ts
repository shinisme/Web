import type { CommonRes } from "./common";

// 회원 가입
export type ReqSignUpDto = { // 회원 가입 요청 시 필요한 데이터
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
    password: string;
};

export type ResSignUpDto = CommonRes<{  // 회원 가입 성공 시 반환되는 데이터
    id: number;
    name: string;
    email: string;
    bio: string | null;
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;

// 로그인

export type ReqSignInDto = { // 로그인 요청 시 필요한 데이터
    email: string; 
    password: string;
}

export type ResSignInDto = CommonRes<{ // 로그인 성공 시 반환되는 데이터
    id: number;
    name: string;
    accessToken: string;
    refreshToken: string;
}>

// 내 정보 조회

export type ResMyInfoDto = CommonRes<{ // 내 정보 조회 성공 시 반환되는 데이터
    id: number;
    name: string;
    email: string;
    bio: string | null;
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;

// 프로필 수정
export type ReqUpdateMyInfoDto = {
    name?: string;
    bio?: string;
    avatar?: string;
};