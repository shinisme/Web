//서버에 LP 목록을 불러오는 함수입니다.
import { axiosInstance } from "./axios";
import type { PaginationDto } from "../types/common";
import type { ResponseLpListDto } from "../types/Lp";

export const getLpList = async ({ cursor, search, order, limit }: PaginationDto): Promise<ResponseLpListDto> => {
    const response = await axiosInstance.get("/v1/lps", {
        params: {
            cursor,
            search,
            order,
            limit,
        },
    });

    return response.data;
};