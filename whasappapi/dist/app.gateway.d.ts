import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthenticationService } from './authentication/authentication.service';
import { SessionService } from './session/session.service';
export declare class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly sessionService;
    private readonly authenticationService;
    wss: Server;
    private logger;
    constructor(sessionService: SessionService, authenticationService: AuthenticationService);
    handleDisconnect(client: Socket): void;
    handleConnection(client: Socket, ...args: any[]): Promise<void>;
    private getTokenFromSocket;
    afterInit(server: Server): void;
    handleQr(clientId: string, url: string, message?: string): void;
    handleEvent(clientId: string, event: string, message?: string): void;
}
