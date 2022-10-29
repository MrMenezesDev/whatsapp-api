import { ISession } from 'src/session/session.service';
export declare class WhasappService {
    constructor();
    sendMessage(number: string, message: string, session: ISession): Promise<any>;
    listMessage(number: string, session: ISession): Promise<any[]>;
    private phoneNumberFormatter;
}
