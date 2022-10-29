import { AppService } from './app.service';
import { AuthenticationService } from './authentication/authentication.service';
import { SessionService } from './session/session.service';
import { WhasappService } from './whasapp/whasapp.service';
export declare class AppController {
    private readonly appService;
    private readonly authenticationService;
    private readonly whasappService;
    private readonly sessionService;
    constructor(appService: AppService, authenticationService: AuthenticationService, whasappService: WhasappService, sessionService: SessionService);
    getHello(): string;
    login(userName: string, password: string): any;
    message(number: string, text: string, headers: any): Promise<void>;
    start(): void;
    stop(): void;
}
