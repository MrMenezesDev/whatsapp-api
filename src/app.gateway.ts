import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Client, Contact, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import { ChatwootService } from './chatwoot/chatwoot.service';
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
    private readonly chatwootService: ChatwootService,
    private readonly whatsAppService: WhatsAppService,
  ) { }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client conected:${client.id}`);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const userId = client.handshake.query.userId as string;
    const user = this.userService.getById(userId);
    let session = this.sessionService.updateSession(userId, { socketId: client.id, ready: false });
    this.logger.log(`User: ${user.name} conected`);
    const wsClient = new Client({
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
    wsClient.initialize();

    wsClient.on('qr', (qr) => {
      this.logger.log('QR RECEIVED', qr);
      qrcode.toDataURL(qr, (err, url) => {
        this.wss.to(client.id).emit('qr', url);
        this.wss.to(client.id).emit('message', 'WhatsAppApi: QRCode recebido, aponte a câmera  seu celular!');
      });
      qrcode.toBuffer(qr, (error, buffer) => {
        // SEND IMAGE
      });
    });

    wsClient.on('ready', () => {
      this.wss.to(client.id).emit('ready', 'WhatsAppApi: Dispositivo pronto!');
      this.wss.to(client.id).emit('message', 'WhatsAppApi: Dispositivo pronto!');
      this.logger.log('WhatsAppApi: Dispositivo pronto');
      const saudacaoes = ['Olá ' + user.name + ', tudo bem?', 'Oi ' + user.name + ', como vai você?', 'Opa ' + user.name + ', tudo certo?'];
      const saudacao = saudacaoes[Math.floor(Math.random() * saudacaoes.length)];
      session = this.sessionService.updateSession(userId, { ready: true, client: wsClient });
      this.whatsAppService.sendMessage(user.number, `${saudacao} A WhatsAppApi está pronta para uso`, session);
    });

    wsClient.on("message", async (message) => {
      let attachment = null;
      if (message.hasMedia) {
        attachment = await message.downloadMedia();
      }

      let messagePrefix: string | undefined;
      let authorContact: Contact;
      //if author != null it means the message was sent to a group chat
      //so we need to prefix the author's name
      if (message.author != null) {
        authorContact = await wsClient.getContactById(message.author);
        messagePrefix = `${authorContact.name ?? authorContact.pushname ?? authorContact.number}: `;
      }

      this.chatwootService.broadcastMessageToChatwoot(message, "incoming", userId, user.chatwoot.accountId, user.chatwoot.inboxId, attachment, messagePrefix);
    });

    wsClient.on("message_create", async (message) => {
      if (message.fromMe) {
          let attachment: MessageMedia | undefined;

          const rawData = <{ self: string }>message.rawData;
          //broadcast WA message to chatwoot only if it was created
          //from a real device/wa web and not from chatwoot app
          //to avoid endless loop
          if (rawData.self === "in") {
              if (message.hasMedia) {
                  attachment = await message.downloadMedia();
              }

              this.chatwootService?.broadcastMessageToChatwoot(
                message, "incoming", userId, user.chatwoot.accountId, user.chatwoot.inboxId, attachment, "");
          }
      }
  });

    wsClient.on('authenticated', () => {
      this.wss.to(client.id).emit('authenticated', 'WhatsAppApi: Autenticado!');
      this.wss.to(client.id).emit('message', 'WhatsAppApi: Autenticado!');
      this.logger.log('WhatsAppApi: Autenticado');
    });

    wsClient.on('auth_failure', function () {
      this.wss.to(client.id).emit('message', 'WhatsAppApi: Falha na autenticação, reiniciando...');
      this.logger.log('WhatsAppApi: Falha na autenticação');
      session = this.sessionService.updateSession(userId, { ready: true });
    });

    wsClient.on('change_state', state => {
      this.logger.log('WhatsAppApi: Status de conexão: ', state);
      session = this.sessionService.updateSession(userId, { ready: true });
    });

    wsClient.on('disconnected', (reason) => {
      this.wss.to(client.id).emit('message', 'WhatsAppApi: Cliente desconectado!');
      session = this.sessionService.updateSession(userId, { ready: true });
      this.logger.log('WhatsAppApi: Cliente desconectado', reason);
      const saudacaoes = ['Olá ' + user.name + ', tudo bem?', 'Oi ' + user.name + ', como vai você?', 'Opa ' + user.name + ', tudo certo?'];
      const saudacao = saudacaoes[Math.floor(Math.random() * saudacaoes.length)];
      session = this.sessionService.updateSession(userId, { ready: true, client: wsClient });
      this.whatsAppService.sendMessage(user.number, `${saudacao} A WhatsAppApi foi desconectada: ${reason}`, session);
      wsClient.initialize();
    });

  }

  afterInit(server: Server) {
    this.logger.log('Initialized');
  }
}
