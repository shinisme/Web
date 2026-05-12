import { useQuery } from "@tanstack/react-query";
import { getLps } from "../../apis/lp";

export const useGetLpList = (sort: 'latest' | 'oldest') => {
    return useQuery({
        queryKey: ["lps", sort],
        queryFn: () => getLps(sort),
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 5,
    });
};