import { Controller, Get, Post, Headers, Body, Param } from '@nestjs/common';
import { SessionService } from 'src/session/session.service';
import { UserService } from 'src/user/user.service';
import { WhatsAppService } from './whatsapp.service';

@Controller()
export class WhatsAppController {
  constructor(
    private readonly userService: UserService,
    private readonly whasappService: WhatsAppService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('message')
  async message(
    @Body('number') number: string,
    @Body('text') text: string,
    @Body('userId') userId: string,
  ) {
    const user = await this.userService.getById(userId);
    const session = this.sessionService.getSession(user.id);
    this.whasappService.sendMessage(number, text, session);
  }
}
