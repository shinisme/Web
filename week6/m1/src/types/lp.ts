export type Lp = {
    id: number;
    title: string;
    content: string;
    thumbnail: string;
    createdAt: string;
    updatedAt: string;
};

export type ResponseLpListDto = {
    status: boolean;
    statusCode: number;
    message: string;
    data: {
        data: Lp[];
        nextCursor: number;
        hasNext: boolean;
    };
};