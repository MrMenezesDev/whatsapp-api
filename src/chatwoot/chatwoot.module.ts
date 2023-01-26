import { Module } from '@nestjs/common';
import { ChatwootService } from './chatwoot.service';
import { ChatwootController } from './chatwoot.controller';
import { UserModule } from 'src/user/user.module';
import { SessionModule } from 'src/session/session.module';
import { WhatsAppModule } from 'src/whatsapp/whatsapp.module';

@Module({
  imports: [UserModule, SessionModule, WhatsAppModule],
  providers: [ChatwootService],
  controllers: [ChatwootController]
})
export class ChatwootModule {}
