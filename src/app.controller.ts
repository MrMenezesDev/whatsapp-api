import { Controller, Get, Post, Headers, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { ISession, SessionService } from './session/session.service';
import { UserService } from './user/user.service';
import { WhatsAppService } from './whatsapp/whatsapp.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
    private readonly whasappService: WhatsAppService,
    private readonly sessionService: SessionService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

}
