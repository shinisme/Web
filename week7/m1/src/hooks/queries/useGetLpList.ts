import { useQuery } from "@tanstack/react-query";
import type { PaginationDto } from "../../types/common";
import { getLpList } from "../../apis/lp";
import { QUERY_KEY } from "../../constants/key";

function useGetLpList({cursor, search, order, limit}: PaginationDto) {
    return useQuery({
        queryKey:[QUERY_KEY.lps],
        queryFn: () => getLpList({
            cursor,
            search,
            order,
            limit
        }),
        // 데이터가 신선하다고 간주하는 시간 ~ 해당 시간 동안에는 캐시된 데이터를 그대로 사용
        staleTime: 1000 * 60 * 5, // ms단위이기 때문에 해당 시간은 5분 의미
        // 사용되지 않는 상태인 쿼리 데이터가 캐시에 남아있는 시간
        // staleTime이 지나고 데이터가 신선하지 않더라도 일정 시간 동안 메모리에 보관
        gcTime: 1000 * 60 * 10, // 10분
        // 조건에 따라 쿼리 실행 여부 제어
        enabled: true
    });
}

export default useGetLpList;