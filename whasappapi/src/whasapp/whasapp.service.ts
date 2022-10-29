import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ISession, SessionService } from 'src/session/session.service';

@Injectable()
export class WhasappService {
  async sendMessage(number: string, message: string, session: ISession) {
    const formatedNumber = this.phoneNumberFormatter(number);
    const { client } = session;
    const isRegisteredNumber = await client.isRegisteredUser(formatedNumber);
    if (!isRegisteredNumber) {
      throw new HttpException(
        'The number is not registred',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const sendedMessage = await client.sendMessage(number, message);

    if (!sendedMessage?.ack) {
      throw new HttpException(sendedMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return sendedMessage;
  }

  async listMessage(number: string, session: ISession) {
    return [];
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
