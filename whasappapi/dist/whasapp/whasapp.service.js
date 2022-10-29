"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhasappService = void 0;
const common_1 = require("@nestjs/common");
let WhasappService = class WhasappService {
    constructor() {
    }
    async sendMessage(number, message, session) {
        const formatedNumber = this.phoneNumberFormatter(number);
        const { client } = session;
        const isRegisteredNumber = await client.isRegisteredUser(formatedNumber);
        if (!isRegisteredNumber) {
            throw new common_1.HttpException("The number is not registred", common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const sendedMessage = await client.sendMessage(number, message);
        if (!(sendedMessage === null || sendedMessage === void 0 ? void 0 : sendedMessage.ack)) {
            throw new common_1.HttpException(sendedMessage, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return sendedMessage;
    }
    async listMessage(number, session) {
        return [];
    }
    phoneNumberFormatter(number) {
        let formatted = number.replace(/\D/g, '');
        if (formatted.startsWith('0')) {
            formatted = '62' + formatted.substr(1);
        }
        if (!formatted.endsWith('@c.us')) {
            formatted += '@c.us';
        }
        return formatted;
    }
};
WhasappService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], WhasappService);
exports.WhasappService = WhasappService;
//# sourceMappingURL=whasapp.service.js.map