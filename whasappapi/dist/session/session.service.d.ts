import { ConfigService } from '@nestjs/config';
export interface ISession {
    id: string;
    socketId: string;
    description: string;
    ready: boolean;
    client: any;
}
export declare class SessionService {
    private readonly configService;
    private sessions;
    private sessionFile;
    constructor(configService: ConfigService);
    private saveSessionsFile;
    private loadSessionsFile;
    getSession(id: string): ISession;
    updateSession(id: string, session: Partial<ISession>): ISession;
    createSession(session: ISession): ISession;
}
