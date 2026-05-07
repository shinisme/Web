import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getLpList } from "../../apis/lp";
import type { PaginationDto } from "../../types/common";
import { QUERY_KEY } from "../../constants/key";
import type { ResponseLpListDto } from "../../types/Lp";

const initialLpListData: ResponseLpListDto = {
    status: true,
    statusCode: 200,
    message: "",
    data: {
        data: [],
        nextCursor: 0,
        hasNext: false,
    },
};

export const useGetLpList = ({ cursor, search, order, limit }: PaginationDto) => {
    return useQuery({
        queryKey: [QUERY_KEY.lps, search, order],
        queryFn: () =>
            getLpList({
                cursor,
                search,
                order,
                limit,
            }),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        placeholderData: keepPreviousData,
        initialData: initialLpListData,
        select: (data) => data.data,
    });
};

/*queryKey: [QUERY_KEY.lps, search, order]
→ search나 order가 바뀌면 React Query가 다른 요청으로 판단함

queryFn: () => getLpList(...)
→ 실제 서버 요청 실행

staleTime
→ 5분 동안은 데이터 신선하다고 봄

gcTime
→ 안 쓰는 캐시를 10분 후 삭제

placeholderData: keepPreviousData
→ 새 데이터를 불러오는 동안 이전 데이터를 잠깐 유지함

initialData
→ 처음 데이터가 없을 때 기본 구조를 미리 넣어둠

select: (data) => data.data
→ 서버 응답 전체에서 실제 LP 목록 데이터 부분만 꺼내서 Home.tsx로 넘김*/