import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhasappModule } from './whasapp/whasapp.module';
import { SessionModule } from './session/session.module';
import { AppGateway } from './app.gateway';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [WhasappModule, SessionModule, AuthenticationModule, UserModule],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
