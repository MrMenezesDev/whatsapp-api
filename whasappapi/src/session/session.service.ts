import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { existsSync, readFileSync, writeFileSync } from "fs";

export interface ISession {
    id: string;
    socketId: string;
    description: string;
    ready: boolean;
    client: any;
}

@Injectable()
export class SessionService {
    private sessions: {
        [id: string]: ISession;
    }
    private sessionFile: string;

    constructor(
        private readonly configService: ConfigService) {
        this.sessionFile = this.configService.get('SESSIONS_FILE')
        this.loadSessionsFile();
    }

    private saveSessionsFile() {
        try {
            writeFileSync(this.sessionFile, JSON.stringify(this.sessions));
        } catch (err) {
            console.log('Failed to save sessions file: ', err);
        }
    }

    private loadSessionsFile() {
        if (!existsSync(this.sessionFile)) {
            try {
                writeFileSync(this.sessionFile, JSON.stringify([]));
                console.log('Sessions file created successfully.');
            } catch (err) {
                console.log('Failed to create sessions file: ', err);
            }
        }
        this.sessions = JSON.parse(readFileSync(this.sessionFile).toString());
    }

    getSession(id: string): ISession {
        const session = this.sessions[id];
        if (session) {
            return session;
        } else {
            throw new HttpException(`Session ${id} not found`, HttpStatus.NOT_FOUND);
        }
    }

    updateSession(id: string, session: Partial<ISession>): ISession {
        const oldSession = this.getSession(id);
        const newSession = { ...oldSession, ...session }
        this.sessions[oldSession.id] = newSession;
        this.saveSessionsFile();
        return newSession;
    }

    createSession(id: string) {
        
        const session: ISession = {client: undefined, description: "", ready: false, id, socketId: ""};
        session.client = new Client({
            restartOnAuthFail: true,
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    // '--single-process', // <- this one doesn't works in Windows
                    '--disable-gpu'
                ],
            },
            authStrategy: new LocalAuth({
                clientId: id
            })
        });
        this.sessions[id] = session;
        this.saveSessionsFile();
        return session;
    }
}