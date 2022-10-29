import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { parse } from 'cookie';
import { Socket, Server } from 'socket.io';
import { SessionService } from './session/session.service';
import { UserService } from './user/user.service';

@WebSocketGateway({ cors: true })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('AppGateway');

  constructor(
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
  ) {}

  handleDisconnect(client: Socket) {
    this.logger.log(`Client conected:${client.id}`);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const userId = client.handshake.query.userId as string; 
    const user = this.userService.getById(userId);
    this.sessionService.updateSession(userId, { socketId: client.id });
    this.logger.log(`User: ${user.name} conected`);
  }

  afterInit(server: Server) {
    this.logger.log('Initialized');
  }

  handleQr(clientId: string, url: string, message?: string): void {
    this.wss.to(clientId).emit('qr', { id: clientId, src: url });
    if (message) {
      this.wss.to(clientId).emit('message', { id: clientId, text: message });
    }
  }

  handleEvent(clientId: string, event: string, message?: string): void {
    this.wss.to(clientId).emit(event, { id: clientId });
    if (message) {
      this.wss.to(clientId).emit('message', { id: clientId, text: message });
    }
  }
}
