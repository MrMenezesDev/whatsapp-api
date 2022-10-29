import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { SessionModule } from './session/session.module';
import { AppGateway } from './app.gateway';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [WhatsAppModule, SessionModule, UserModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
