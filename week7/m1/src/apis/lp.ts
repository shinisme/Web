import axios from "axios"
import type { PaginationDto } from "../types/common"
import type { ResponseLpListDto, ReqCreateLpDto } from "../types/lp";
import { LOCAL_STORAGE_KEY } from "../constants/key";

const getAuthHeader = () => {
    try {
        const token = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_KEY.ACCESS_TOKEN) ?? "null"
        );
        return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
        return {};
    }
};

export const getLpList = async (paginationDto: PaginationDto): Promise<ResponseLpListDto> => {
    const { data } = await axios.get(`${import.meta.env.VITE_SERVER_API_URL}/v1/lps`, {
        params: paginationDto,
    });

    return data;
}; // LP 목록 조회 API

export const postLp = async (body: ReqCreateLpDto) => {
    const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_API_URL}/v1/lps`,
        body,
        { headers: getAuthHeader() }
    );
    return data;
}; // LP 생성 API 추가

export const updateLp = async ({
    lpId,
    body,
}: {
    lpId: number;
    body: Partial<ReqCreateLpDto>;
}) => {
    const { data } = await axios.patch(
        `${import.meta.env.VITE_SERVER_API_URL}/v1/lps/${lpId}`,
        body,
        { headers: getAuthHeader() }
    );
    return data;
}; // LP 수정 API 추가

export const deleteLpApi = async (lpId: number) => {
    await axios.delete(
        `${import.meta.env.VITE_SERVER_API_URL}/v1/lps/${lpId}`,
        { headers: getAuthHeader() }
    );
};//    LP 삭제 API 추가



export const postComment = async ({
    lpId,
    content,
}: {
    lpId: number;
    content: string;
}) => {
    const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_API_URL}/v1/lps/${lpId}/comments`,
        { content },
        { headers: getAuthHeader() }
    );
    return data;
}; // 댓글 작성 API 추가

export const updateComment = async ({
    lpId,
    commentId,
    content,
}: {
    lpId: number;
    commentId: number;
    content: string;
}) => {
    const { data } = await axios.patch(
        `${import.meta.env.VITE_SERVER_API_URL}/v1/lps/${lpId}/comments/${commentId}`,
        { content },
        { headers: getAuthHeader() }
    );
    return data;
}; // 댓글 수정 API 추가

export const deleteComment = async ({
    lpId,
    commentId,
}: {
    lpId: number;
    commentId: number;
}) => {
    await axios.delete(
        `${import.meta.env.VITE_SERVER_API_URL}/v1/lps/${lpId}/comments/${commentId}`,
        { headers: getAuthHeader() }
    );
}; // 댓글 삭제 API 추가

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axios.post(
    `${import.meta.env.VITE_SERVER_API_URL}/v1/uploads`,
    formData,
    {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data.data.imageUrl;
}; // 이미지 업로드 API 추가

export const addLike = async (lpId: number) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_SERVER_API_URL}/v1/lps/${lpId}/likes`,
    {},
    { headers: getAuthHeader() }
  );
  return data;
};

export const removeLike = async (lpId: number) => {
  const { data } = await axios.delete(
    `${import.meta.env.VITE_SERVER_API_URL}/v1/lps/${lpId}/likes`,
    { headers: getAuthHeader() }
  );
  return data;
}; // 좋아요 추가 API와 삭제 API를 별도로 구현