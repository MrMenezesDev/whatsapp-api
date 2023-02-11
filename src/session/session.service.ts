import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync, writeFileSync } from "fs";

export interface ISession {
    id: string;
    socketId?: string;
    ready: boolean;
    client?: any
}

@Injectable()
export class SessionService {
    private sessions: ISession[] = [];
    private sessionFile: string;

    constructor(
        private readonly configService: ConfigService) {
        this.sessionFile = this.configService.get('SESSIONS_FILE')
        this.loadSessionsFile();
    }

    private saveSessionsFile() {
        try {
            const sessions = this.sessions.map((session) => {
                return {
                    ...session,
                    client: ""
                }
            })
            writeFileSync(this.sessionFile, JSON.stringify(sessions));
        } catch (err) {
            console.error('Failed to save sessions file: ', err);
        }
    }

    private loadSessionsFile() {
        if (!existsSync(this.sessionFile)) {
            try {
                writeFileSync(this.sessionFile, JSON.stringify([]));
            } catch (err) {
                console.error('Failed to create sessions file: ', err);
            }
        }
        this.sessions = JSON.parse(readFileSync(this.sessionFile).toString());
    }

    getSession(id: string): ISession {
        const session = this.sessions.find(sess => sess.id = id)
        if (session) {
            return session;
        } else {
            throw new HttpException(`Session ${id} not found`, HttpStatus.NOT_FOUND);
        }
    }

    updateSession(id: string, session: Partial<ISession>): ISession {
        const sessionIndex = this.sessions.findIndex(sess => sess.id == id);
        const oldSession = this.getSession(id);
        const newSession = { ...oldSession, ...session }
        this.sessions[sessionIndex] = newSession;
        this.saveSessionsFile();
        return newSession;
    }

    createSession(id: string) {
        let session = this.sessions.find(sess => sess.id = id)
        if (session) {
            return session;
        } else {
            session = {
                id,
                ready: false
            }
        }
        this.sessions.push(session);
        this.saveSessionsFile();
        return session;
    }
}