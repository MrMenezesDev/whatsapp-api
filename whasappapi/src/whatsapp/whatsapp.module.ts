import { Module } from '@nestjs/common';
import { SessionModule } from 'src/session/session.module';
import { SessionService } from 'src/session/session.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';

@Module({
  imports: [UserModule, SessionModule],
  providers: [WhatsAppService],
  exports: [WhatsAppService],
  controllers: [WhatsAppController]
})
export class WhatsAppModule {}
