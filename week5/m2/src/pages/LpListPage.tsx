import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLps } from "../api/lp";

function LpListPage() {
    const [sort, setSort] = useState<'latest' | 'oldest'>('latest');

    const { data: lps, isLoading, isError, refetch } = useQuery({
        queryKey: ['lps', sort], //sort가 latest이면 ['lps', 'latest']
        queryFn: () => getLps(sort), //sort가 oldest이면 ['lps', 'oldest']
        //키가 바뀌니까 React Query가 자동으로 getLps 함수를 다시 실행해서 데이터를 최신화 해줍니다.
        staleTime: 60 * 1000, // 1분
        gcTime: 5 * 60 * 1000, // 5분
    });

    if (isLoading) return <div>로딩 중...</div>;

    if (isError) {
        return (
            <div>
                <p>LP 목록을 불러오는 중 오류가 발생했습니다.</p>
                <button onClick={() => refetch()}>다시 시도</button>
            </div>
        );
    }

    return (
        <main>
            <h1>LP 목록</h1>

            <button onClick={() => setSort('latest')}>최신순</button>
            <button onClick={() => setSort('oldest')}>오래된순</button>

            <pre>{JSON.stringify(lps, null, 2)}</pre>
        </main>
    );
}

export default LpListPage;