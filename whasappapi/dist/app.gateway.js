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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const cookie_1 = require("cookie");
const socket_io_1 = require("socket.io");
const authentication_service_1 = require("./authentication/authentication.service");
const session_service_1 = require("./session/session.service");
let AppGateway = class AppGateway {
    constructor(sessionService, authenticationService) {
        this.sessionService = sessionService;
        this.authenticationService = authenticationService;
        this.logger = new common_1.Logger('AppGateway');
    }
    handleDisconnect(client) {
        this.logger.log(`Client conected:${client.id}`);
    }
    async handleConnection(client, ...args) {
        const token = this.getTokenFromSocket(client);
        const user = await this.authenticationService.getUserFromAuthenticationToken(token);
        this.sessionService.updateSession(user.id, { socketId: client.id });
        this.logger.log(`User: ${user.name} conected`);
    }
    getTokenFromSocket(client) {
        const cookie = client.handshake.headers.cookie;
        const { Authentication: authenticationToken } = (0, cookie_1.parse)(cookie);
        return authenticationToken;
    }
    afterInit(server) {
        this.logger.log('Initialized');
    }
    handleQr(clientId, url, message) {
        this.wss.to(clientId).emit('qr', { id: clientId, src: url });
        if (message) {
            this.wss.to(clientId).emit('message', { id: clientId, text: message });
        }
    }
    handleEvent(clientId, event, message) {
        this.wss.to(clientId).emit(event, { id: clientId });
        if (message) {
            this.wss.to(clientId).emit('message', { id: clientId, text: message });
        }
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AppGateway.prototype, "wss", void 0);
AppGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true }),
    __metadata("design:paramtypes", [session_service_1.SessionService, typeof (_a = typeof authentication_service_1.AuthenticationService !== "undefined" && authentication_service_1.AuthenticationService) === "function" ? _a : Object])
], AppGateway);
exports.AppGateway = AppGateway;
//# sourceMappingURL=app.gateway.js.map