export type PaginationDto = {
    cursor?: number;
    search?: string;
    order?: "asc" | "desc";
    limit?: number;
};

/*cursor → 어디서부터 가져올지
search → 검색어
order → 정렬 방향
limit → 몇 개 가져올지*/

export type CommonRes<T> = {
    status: boolean;
    message: string;
    data: T
}