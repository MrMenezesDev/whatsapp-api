import { Body, Controller, Post } from '@nestjs/common';
import { ChatwootService } from './chatwoot.service';
import { ChatwootMessagePayload } from '@mrmenezesdev/chatwoot-client';
import { SessionService } from 'src/session/session.service';
import { WhatsAppService } from 'src/whatsapp/whatsapp.service';

@Controller('chatwoot')
export class ChatwootController {
    constructor(
        private readonly chatwootService: ChatwootService,
        private readonly sessionService: SessionService,
        private readonly whatsAppService: WhatsAppService,
    ) { }

    @Post('message')
    async message(
      @Body() message: ChatwootMessagePayload
    ) {
        const user = await this.chatwootService.getUserFromMessage(message);
        const session = await this.sessionService.getSession(user.id);
        await this.whatsAppService.sendMessage(message.conversation.contact_inbox.source_id.split(":")[1], message.content, session);
    }
  
}
