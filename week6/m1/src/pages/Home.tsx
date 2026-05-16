import { useState } from "react";
import { useGetLpList } from "../hooks/queries/useGetLpList";

export default function Home() {
    const [search, setSearch] = useState("");
    const [order, setOrder] = useState<"asc" | "desc">("desc");

    const { data, isLoading, isError, refetch } = useGetLpList({
        cursor: 0,
        search,
        order,
        limit: 10,
    });
console.log("LP DATA:", data);
    if (isLoading) {
        return <div>로딩 중...</div>;
    }

    if (isError) {
        return (
            <div>
                <p>LP 목록을 불러오지 못했습니다.</p>
                <button onClick={() => refetch()}>다시 시도</button>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">LP 목록</h1>

                <div className="flex gap-2">
                    <button
                        onClick={() => setOrder("desc")}
                        className="px-3 py-2 rounded-sm bg-[#0ECFD3] text-[#063B3D] font-bold"
                    >
                        최신순
                    </button>
                    <button
                        onClick={() => setOrder("asc")}
                        className="px-3 py-2 rounded-sm bg-[#B7EDEA] text-[#063B3D] font-bold"
                    >
                        오래된순
                    </button>
                </div>
            </div>

            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-[#ccccccc8] rounded-sm w-[400px] focus:border-[#0ECFD3] outline-none p-[8px] mb-6"
                placeholder="LP 검색"
            />

            <div>
                {data?.data?.length === 0 && (
                    <p className="text-[#063B3D]">등록된 LP가 없습니다.</p>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
                    {data?.data?.map((lp) => (
                        <div
                            key={lp.id}
                            className="border border-[#B7EDEA] hover:scale-105 transition hover:shadow-lg bg-white rounded-md overflow-hidden shadow-sm"
                        >
                            <div className="aspect-square bg-[#F4FFFC]">
                                <img
                                    src={lp.thumbnail}
                                    alt={lp.title}
                                    className="h-full w-full object-cover hover:scale-110 transition overflow-hidden"
                                />
                            </div>

                            <div className="p-4">
                                <h1 className="font-bold text-[#063B3D] mb-2">{lp.title}</h1>
                                <p className="text-sm text-gray-500 line-clamp-3">{lp.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}