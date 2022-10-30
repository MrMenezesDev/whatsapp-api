import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { SessionService } from './session/session.service';
import { UserService } from './user/user.service';
import { WhatsAppService } from './whatsapp/whatsapp.service';
const qrcode = require('qrcode');

@WebSocketGateway({ cors: true })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('AppGateway');

  constructor(
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
    private readonly whatsAppService: WhatsAppService,
  ) { }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client conected:${client.id}`);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const userId = client.handshake.query.userId as string;
    const user = this.userService.getById(userId);
    const session = this.sessionService.updateSession(userId, { socketId: client.id });
    this.logger.log(`User: ${user.name} conected`);
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
          clientId: userId
      })
  });
    session.client.initialize();
    session.client.on('qr', (qr) => {
      this.logger.log('QR RECEIVED', qr);
      qrcode.toDataURL(qr, (err, url) => {
        this.wss.to(client.id).emit('qr', url);
        this.wss.to(client.id).emit('message', 'WhatsAppApi: QRCode recebido, aponte a câmera  seu celular!');
      });
    });
    session.client.on('ready', () => {
      this.wss.to(client.id).emit('ready', 'WhatsAppApi: Dispositivo pronto!');
      this.wss.to(client.id).emit('message', 'WhatsAppApi: Dispositivo pronto!');
      this.logger.log('WhatsAppApi: Dispositivo pronto');
      const saudacaoes = ['Olá ' + user.name + ', tudo bem?', 'Oi ' + user.name + ', como vai você?', 'Opa ' + user.name + ', tudo certo?'];
      const saudacao = saudacaoes[Math.floor(Math.random() * saudacaoes.length)];
      this.whatsAppService.sendMessage(user.number, `${saudacao} A WhatsAppApi está pronta para uso`, session);
    });
    session.client.on('authenticated', () => {
      this.wss.to(client.id).emit('authenticated', 'WhatsAppApi: Autenticado!');
      this.wss.to(client.id).emit('message', 'WhatsAppApi: Autenticado!');
      this.logger.log('WhatsAppApi: Autenticado');
    });

    session.client.on('auth_failure', function () {
      this.wss.to(client.id).emit('message', 'WhatsAppApi: Falha na autenticação, reiniciando...');
      console.error('WhatsAppApi: Falha na autenticação');
    });

    session.client.on('change_state', state => {
      this.logger.log('WhatsAppApi: Status de conexão: ', state);
    });

    session.client.on('disconnected', (reason) => {
      this.wss.to(client.id).emit('message', 'WhatsAppApi: Cliente desconectado!');
      this.logger.log('WhatsAppApi: Cliente desconectado', reason);
      // TODO: Send email
      session.client.initialize();
    });

  }
  afterInit(server: Server) {
    this.logger.log('Initialized');
  }
}
