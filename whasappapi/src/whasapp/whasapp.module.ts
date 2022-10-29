import { Module } from '@nestjs/common';
import { WhasappService } from './whasapp.service';

@Module({
  providers: [WhasappService],
})
export class WhasappModule {}
