import { Injectable } from '@nestjs/common';

export interface IUser {
    id: string;
    name: string;
}

@Injectable()
export class UserService {
    users: IUser[] = [{
        id: "01",
        name: "Erick"
    }];

    getById(userId: string): IUser {
        return this.users.find(user => userId === user.id);
    }
    getByUserName(userName: string): IUser {
        return this.users.find(user => userName === user.name);
    }
}
