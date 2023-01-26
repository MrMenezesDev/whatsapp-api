import { ChatwootClient, ChatwootMessagePayload } from '@chatwoot/client';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SessionService } from 'src/session/session.service';
import { UserService } from 'src/user/user.service';
import { Chat, Message } from 'whatsapp-web.js';

@Injectable()
export class ChatwootService {
    inboxUser: {
        [key: string]: string;
    }

    constructor(
        private readonly userService: UserService,
        private readonly sessionService: SessionService,
    ) { }

    getUserFromMessage(message: ChatwootMessagePayload) {
        const userId = this.inboxUser[message.inbox.id];
        if (!userId) {
            throw new HttpException(`Inbox ${message.inbox.id} not found`, HttpStatus.NOT_FOUND);
        }
        const user = this.userService.getById(userId);
        if (!user.chatwoot) {
            throw new HttpException(`Chatwood not configured`, HttpStatus.FAILED_DEPENDENCY);
        }
        return user;
    }

    getClient(userId: string): ChatwootClient {
        const { chatwoot } = this.userService.getById(userId);
        return new ChatwootClient({
            apiAccessToken: chatwoot.apiAccessToken,
            apiVersion: chatwoot.apiVersion,
            host: chatwoot.host
        });
    }

    async configWhatsapp(userId: string, accountId: string, qr?: any) {
        const user = this.userService.getById(userId);
        const chatwootClient = this.getClient(userId);
        // buscar ou criar contato de configuração
        // buscar ou criar conversa com contato de configuração
        // Envia uma mensagem inicial para configuração do whatsapp
        // envia uma mensagem com QR Code caso exista
        // retorna todas informações manutenção da conversa
    }

    async broadcastMessageToChatwoot(message: Message, type: "outgoing" | "incoming", userId: string, accountId: string, inboxId: number, attachment: any, messagePrefix: string | undefined) {

        let chatwootConversation: any = null;
        let contactNumber = "";
        let contactName = "";
        const messageChat: Chat = await message.getChat();
        const contactIdentifier = `${messageChat.id.user}@${messageChat.id.server}`;
        const sourceId = "WhatsappWeb.js:" + contactIdentifier;

        //we use the chat name as the chatwoot contact name
        //when chat is private, the name of the chat represents the contact's name
        //when chat is group, the name of the chat represents the group name
        contactName = messageChat.name;

        //if chat is group chat, whe use the name@groupId as the query to search for the contact
        //otherwhise we search by phone number
        // if (!messageChat.isGroup) {
        //     contactNumber = `+${messageChat.id.user}`;
        // }

        let chatwootContact = await this.findChatwootContactByIdentifier(contactIdentifier, userId, accountId);

        if (chatwootContact == null) {
            chatwootContact = await this.findChatwootContactByPhone(contactNumber, userId, accountId);

            if (chatwootContact == null) {
                const result = <{ contact: object }>(
                    await this.makeChatwootContact(inboxId, contactName, contactNumber, contactIdentifier, userId, accountId)
                );
                chatwootContact = result.contact;
            } else {
                //small improvement to update identifier on contacts who don't have WA identifier
                const updatedData = { identifier: contactIdentifier };
                await this.updateChatwootContact(chatwootContact.id, updatedData, userId, accountId);
            }
        } else {
            chatwootConversation = await this.getChatwootContactConversationByInboxId(
                chatwootContact.id,
                inboxId,
                userId,
                accountId
            );
        }

        if (chatwootConversation == null) {
            chatwootConversation = await this.makeChatwootConversation(
                sourceId,
                inboxId,
                chatwootContact.id,
                userId,
                accountId
            );

            //we set the group members if conversation is a group chat
            // if (messageChat.isGroup) {
            //     this.updateChatwootConversationGroupParticipants(messageChat as GroupChat);
            // }
        }

        //if message to post on chatwoot is outgoing
        //it means it was created from other WA cliente (web or device)
        //therefore we mark it as private so we can filter it
        //when receiving it from the webhook (in later steps) to avoid duplicated messages
        let isPrivate = false;
        if (type == "outgoing") {
            isPrivate = true;
        }


        await this.getClient(userId).conversations(accountId).postChatwootMessage(
            chatwootConversation.id as string,
            message.body,
            type,
            isPrivate,
            messagePrefix,
            attachment
        );
    }


    async findChatwootContactByIdentifier(identifier: string, userId: string, accountId: string) {
        const contacts = await this.getClient(userId).contacts(accountId).search(identifier)
        for (const contact of contacts) {
            //in order to retrieve a chatwoot contact by identifier,
            //we search contacts with query, however this can get false positives
            //since query searches for the value in several fields, not just identifier
            //so we add extra validation to ensure the retrieved contact's identifier
            //actually matches searched one
            if (contact.identifier == identifier) {
                return contact;
            }

        }
        return null;
    }

    async findChatwootContactByPhone(phone: string, userId: string, accountId: string) {
        const contacts = await this.getClient(userId).contacts(accountId).search(phone)
        if (contacts.length > 0) {
            for (const contact of contacts) {
                //in order to retrieve a chatwoot contact by phone,
                //we search contacts with query, however this can get false positives
                //since query searches for the value in several fields, not just phone number
                //so we add extra validation to ensure the retrieved contact's phone number
                //actually matches searched one
                if (contact.phone_number == phone) {
                    return contact;
                }
            }
        }
        return null;
    }



    async makeChatwootContact(inboxId: number, name: string, phoneNumber: string, identifier: string | undefined, userId: string, accountId: string): Promise<any> {
        return this.getClient(userId).contacts(accountId).create({
            identifier,
            inbox_id: inboxId,
            name: name,
            phone_number: phoneNumber,
        });
    }

    async updateChatwootContact(contactId: string | number, updatedData: any, userId: string, accountId: string): Promise<any> {
        return this.getClient(userId).contacts(accountId).update(contactId, updatedData);
    }

    async makeChatwootConversation(sourceId: string | number, inboxId: string | number, contactId: string | number, userId: string, accountId: string) {

        const conversationPayload = {
            source_id: sourceId,
            inbox_id: inboxId,
            contact_id: contactId,
        };
        const { data } = await this.getClient(userId).conversations(accountId).create(conversationPayload);

        return data;
    }

    async getChatwootContactConversationByInboxId(contactId: string | number, inboxId: string | number, userId: string, accountId: string) {
        const chatwootConversations = (await this.getClient(userId).contacts(accountId).getConversationsByContactId(contactId)).data.payload as Array<any>;
        const chatwootConversation = chatwootConversations.find((conversation: any) => {
            return conversation.inbox_id == inboxId;
        });

        return chatwootConversation;
    }



}

