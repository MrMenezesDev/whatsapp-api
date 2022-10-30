import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

@Module({
  imports: [UserModule],
  providers: [SessionService, ConfigService],
  exports: [SessionService],
  controllers: [SessionController]
})
export class SessionModule {}
