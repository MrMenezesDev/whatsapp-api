export interface IUser {
    id: string;
    name: string;
}
export declare class UserService {
    users: IUser[];
    getById(userId: string): IUser;
    getByUserName(userName: string): IUser;
}
