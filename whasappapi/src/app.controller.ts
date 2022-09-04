import { Controller, Get, Post, Headers } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthenticationService } from './authentication/authentication.service';
import { SessionService } from './session/session.service';
import { WhasappService } from './whasapp/whasapp.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly authenticationService: AuthenticationService,
    private readonly whasappService: WhasappService,
    private readonly sessionService: SessionService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('login')
  login(userName: string, password: string) {
    return this.authenticationService.login(userName, password);
  }

  @Post('message')
  async message(number: string, text: string, @Headers("Authentication") headers) {
    const user = await this.authenticationService.getUserFromAuthenticationToken(headers["Authentication"]);
    const session = this.sessionService.getSession(user.id);
    this.whasappService.sendMessage(number, text, session);
  }

  @Post('start')
  start() {

  }

  @Post('stop')
  stop() {
    
  }
}
