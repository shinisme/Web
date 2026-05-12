//서버한테 LP 목록을 불러오는 함수입니다. sort는 최신순('latest') 또는 오래된순('oldest')으로 정렬할 수 있습니다.
import { axiosInstance } from "./axios";

export const getLps = async (sort: 'latest' | 'oldest') => {
    const response = await axiosInstance.get(`/lps/1?sort=${sort}`);

    if (!response.ok) {
        throw new Error('LP 목록을 불러오지 못했습니다.');
    }

    return response.data;
};