export type Lp = {
    id: number;
    title: string;
    content?: string;
    thumbnail?: string;
    createdAt?: string;
    updatedAt?: string;
    likes?: number;
};

export type GetLpsResponse = {
    data: Lp[];
};