import type { CommonRes } from "./common";

// 회원 가입
export type ReqSignUpDto = {
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
    password: string;
};

export type ResSignUpDto = CommonRes<{
    id: number;
    name: string;
    email: string;
    bio: string | null;
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;

// 로그인

export type ReqSignInDto = {
    email: string;
    password: string;
}

export type ResSignInDto = CommonRes<{
    id: number;
    name: string;
    accessToken: string;
    refreshToken: string;
}>

// 내 정보 조회

export type ResMyInfoDto = CommonRes<{
    id: number;
    name: string;
    email: string;
    bio: string | null;
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;