"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs_1 = require("fs");
const whatsapp_web_js_1 = require("whatsapp-web.js");
let SessionService = class SessionService {
    constructor(configService) {
        this.configService = configService;
        this.loadSessionsFile();
        this.sessionFile = this.configService.get('SESSIONS_FILE');
    }
    saveSessionsFile() {
        fs_1.default.writeFile(this.sessionFile, JSON.stringify(this.sessions), function (err) {
            if (err) {
                console.log(err);
            }
        });
    }
    loadSessionsFile() {
        if (!fs_1.default.existsSync(this.sessionFile)) {
            try {
                fs_1.default.writeFileSync(this.sessionFile, JSON.stringify([]));
                console.log('Sessions file created successfully.');
            }
            catch (err) {
                console.log('Failed to create sessions file: ', err);
            }
        }
        this.sessions = JSON.parse(fs_1.default.readFileSync(this.sessionFile).toString());
    }
    getSession(id) {
        const session = this.sessions[id];
        if (session) {
            return session;
        }
        else {
            throw new common_1.HttpException(`Session ${id} not found`, common_1.HttpStatus.NOT_FOUND);
        }
    }
    updateSession(id, session) {
        const oldSession = this.getSession(id);
        const newSession = Object.assign(Object.assign({}, oldSession), session);
        this.sessions[oldSession.id] = newSession;
        this.saveSessionsFile();
        return newSession;
    }
    createSession(session) {
        session.client = new whatsapp_web_js_1.Client({
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
                    '--disable-gpu'
                ],
            },
            authStrategy: new whatsapp_web_js_1.LocalAuth({
                clientId: session.id
            })
        });
        this.sessions[session.id] = session;
        this.saveSessionsFile();
        return session;
    }
};
SessionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SessionService);
exports.SessionService = SessionService;
//# sourceMappingURL=session.service.js.map