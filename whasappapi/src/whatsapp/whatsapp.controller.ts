import { Controller, Get, Post, Headers, Body, Param, Query } from '@nestjs/common';
import { get } from 'http';
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
    return this.whasappService.sendMessage(number, text, session);
  }

  
  @Get('message/:userId')
  async serachMessage(
    @Param('userId') userId: string,
    @Query('search') search: string,
    @Query('chatId') chatId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const user = await this.userService.getById(userId);
    const session = this.sessionService.getSession(user.id);
    return this.whasappService.searchMessages(search, session, {chatId, page, limit});
  }

  @Get('contact/:userId')
  async contacts(
    @Param('userId') userId: string,
  ) {
    const user = await this.userService.getById(userId);
    const session = this.sessionService.getSession(user.id);
    return this.whasappService.getContatcs(session);
  }

  @Get('contact/:userId/contact/:contactId')
  async contactsById(
    @Param('userId') userId: string,
    @Param('contactId') contactId: string,
  ) {
    const user = await this.userService.getById(userId);
    const session = this.sessionService.getSession(user.id);
    return this.whasappService.getContatcById(contactId, session);
  }

  @Get('chat/:userId')
  async chats(
    @Param('userId') userId: string,
  ) {
    const user = await this.userService.getById(userId);
    const session = this.sessionService.getSession(user.id);
    return this.whasappService.getChats(session);
  }

  

  @Get('chat/:userId/chat/:chatId')
  async chatById(
    @Param('userId') userId: string,
    @Param('chatId') chatId: string,
  ) {
    const user = await this.userService.getById(userId);
    const session = this.sessionService.getSession(user.id);
    return this.whasappService.getChatById(chatId, session);
  }
  
}
