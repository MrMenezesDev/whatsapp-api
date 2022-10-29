import { Controller, Get, Post, Headers, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { SessionService } from './session/session.service';
import { UserService } from './user/user.service';
import { WhasappService } from './whasapp/whasapp.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
    private readonly whasappService: WhasappService,
    private readonly sessionService: SessionService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

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
