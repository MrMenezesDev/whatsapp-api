import { Injectable } from '@nestjs/common';

export interface IUser {
  id: string;
  name: string;
  number: string;
}

@Injectable()
export class UserService {
  users: IUser[] = [
    {
      id: '01',
      name: 'Erick',
      number: '55 71 86672923'
    },
  ];

  getById(userId: string): IUser {
    return this.users.find((user) => userId === user.id);
  }
  getByUserName(userName: string): IUser {
    return this.users.find((user) => userName === user.name);
  }
}
