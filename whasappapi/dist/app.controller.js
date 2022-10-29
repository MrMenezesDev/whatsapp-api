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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const authentication_service_1 = require("./authentication/authentication.service");
const session_service_1 = require("./session/session.service");
const whasapp_service_1 = require("./whasapp/whasapp.service");
let AppController = class AppController {
    constructor(appService, authenticationService, whasappService, sessionService) {
        this.appService = appService;
        this.authenticationService = authenticationService;
        this.whasappService = whasappService;
        this.sessionService = sessionService;
    }
    getHello() {
        return this.appService.getHello();
    }
    login(userName, password) {
        return this.authenticationService.login(userName, password);
    }
    async message(number, text, headers) {
        const user = await this.authenticationService.getUserFromAuthenticationToken(headers["Authentication"]);
        const session = this.sessionService.getSession(user.id);
        this.whasappService.sendMessage(number, text, session);
    }
    start() {
    }
    stop() {
    }
};
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Post)('login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('message'),
    __param(2, (0, common_1.Headers)("Authentication")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "message", null);
__decorate([
    (0, common_1.Post)('start'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "start", null);
__decorate([
    (0, common_1.Post)('stop'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "stop", null);
AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService, typeof (_a = typeof authentication_service_1.AuthenticationService !== "undefined" && authentication_service_1.AuthenticationService) === "function" ? _a : Object, whasapp_service_1.WhasappService,
        session_service_1.SessionService])
], AppController);
exports.AppController = AppController;
//# sourceMappingURL=app.controller.js.map