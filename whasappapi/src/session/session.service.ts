import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from "fs";
import { Client, LocalAuth } from 'whatsapp-web.js';

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
        [name: string]: ISession;
    }
    private sessionFile: string;

    constructor(
        private readonly configService: ConfigService) {
        this.loadSessionsFile();
        this.sessionFile = this.configService.get('SESSIONS_FILE')
    }

    private saveSessionsFile() {
        fs.writeFile(this.sessionFile, JSON.stringify(this.sessions), function (err) {
            if (err) {
                console.log(err);
            }
        });
    }

    private loadSessionsFile() {
        if (!fs.existsSync(this.sessionFile)) {
            try {
                fs.writeFileSync(this.sessionFile, JSON.stringify([]));
                console.log('Sessions file created successfully.');
            } catch (err) {
                console.log('Failed to create sessions file: ', err);
            }
        }
        this.sessions = JSON.parse(fs.readFileSync(this.sessionFile).toString());
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
        const newSession = {...oldSession, ...session}
        this.sessions[oldSession.id] = newSession;
        this.saveSessionsFile();
        return newSession;
    }

    createSession(session: ISession) {
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
                clientId: session.id
            })
        });
        this.sessions[session.id] = session;
        this.saveSessionsFile();
        return session;
    }
}