import type { CursorBasedResponse, CommonRes } from "./common";

export type Tag = {
    id: number;
    name: string;
};

export type Likes = {
    id: number;
    userId: number;
    lpId: number;
};

export type LpData = {
    id: number;
    title: string;
    content: string;
    thumbnail: string;
    published: boolean;
    authorId: number;
    createdAt: Date;
    updatedAt: Date;
    tags: Tag[];
    likes: Likes[];
};

export type ResponseLpListDto = CursorBasedResponse<{
    data: LpData;
}>;

export type ResLpDto = CommonRes<LpData>;

export type ReqCreateLpDto = {
    title: string;
    content: string;
    thumbnail?: string;
    published: boolean;
    tags: string[];
};

export type CommentData = {
    id: number;
    content: string;
    authorId: number;
    author: { name: string };
    createdAt: Date;
};

export type ResCommentListDto = CursorBasedResponse<{
    data: CommentData[];
}>;