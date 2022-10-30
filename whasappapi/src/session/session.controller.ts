import { Controller, Get, Post, Param } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {}


  @Get(':userId')
  async getSession(
    @Param('userId') userId: string
  ) {
    const user = this.userService.getById(userId);
    const session = this.sessionService.getSession(user.id);
    return {
      ...session,
      client: undefined
    }
  }

  @Post(':userId')
  async createSession(
    @Param('userId') userId: string
  ) {
    const user = this.userService.getById(userId);
    const session = this.sessionService.createSession(user.id);
    return {
      ...session,
      client: undefined
    }
  }
  
}
