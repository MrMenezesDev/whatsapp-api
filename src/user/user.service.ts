import { Injectable } from '@nestjs/common';

export interface IUser {
  id: string;
  name: string;
  number: string;
  chatwoot?: {
    inboxId: number
    host: string;
    apiAccessToken: string;
    apiVersion?: string;
    accountId: string;
    id: string;
  }
}

@Injectable()
export class UserService {
  users: IUser[] = [
    {
      id: '01',
      name: 'Erick',
      number: '55 71 86672923',
      chatwoot: {
        inboxId: 1,
        accountId: "01",
        apiAccessToken: "ND8VsvE1r5WQYNFtAiWNM3mo",
        host: "https://15.229.77.171",
        id: "01"
      }
    },
  ];

  getById(userId: string): IUser {
    return this.users.find((user) => userId === user.id);
  }
  getByUserName(userName: string): IUser {
    return this.users.find((user) => userName === user.name);
  }
}
