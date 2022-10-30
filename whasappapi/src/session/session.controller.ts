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
    return this.sessionService.getSession(user.id);
  }

  @Post(':userId')
  async createSession(
    @Param('userId') userId: string
  ) {
    const user = this.userService.getById(userId);
    return this.sessionService.createSession(user.id);
  }
}
