import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ISession } from 'src/session/session.service';
import { Client, MessageAck } from 'whatsapp-web.js';

@Injectable()
export class WhatsAppService {
  private getClient(session: ISession): Client {
    const { client } = session;
    if (!client || client.ready === false) {
      throw new HttpException('Client not ready', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return client;
  }
  async sendMessage(number: string, message: string, session: ISession) {
    const formatedNumber = this.phoneNumberFormatter(number);
    const client = this.getClient(session);
    const isRegisteredNumber = await client.isRegisteredUser(formatedNumber);
    if (!isRegisteredNumber) {
      throw new HttpException(
        'The number is not registred',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const sendedMessage = await client.sendMessage(formatedNumber, message);

    if (sendedMessage?.ack === MessageAck.ACK_ERROR) {
      throw new HttpException(sendedMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return sendedMessage;
  }

  async getContatcs(session: ISession) {
    const client = this.getClient(session);
    return client.getContacts();
  }

  async getChats(session: ISession) {
    const client = this.getClient(session);
    return client.getChats();
  }

  async getContatcById(contactId: string, session: ISession) {
    const client = this.getClient(session);
    return client.getContactById(contactId);
  }

  async getChatById(chatId: string, session: ISession) {
    const client = this.getClient(session);
    return client.getChatById(chatId)
  }

  async searchMessages(query: string, session: ISession, options?: { chatId?: string, page?: number, limit?: number }) {
    const client = this.getClient(session);
    return client.searchMessages(query, options)
  }

  private phoneNumberFormatter(number) {
    // 1. Menghilangkan karakter selain angka
    let formatted = number.replace(/\D/g, '');

    // 2. Menghilangkan angka 0 di depan (prefix)
    //    Kemudian diganti dengan 62
    if (formatted.startsWith('0')) {
      formatted = '62' + formatted.substr(1);
    }

    if (!formatted.endsWith('@c.us')) {
      formatted += '@c.us';
    }

    return formatted;
  }
}
