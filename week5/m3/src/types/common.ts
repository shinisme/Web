export type CommonRes<T> = {
    status: boolean;
    message: string;
    data: T
}