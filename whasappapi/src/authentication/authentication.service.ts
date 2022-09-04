import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from 'src/session/session.service';
import { IUser, UserService } from 'src/user/user.service';



interface ITokenPayload {
    userId: string;
}

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly usersService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly sessionService: SessionService
    ) { }

    public async login(userName: string, password: string) {
        const user = await this.usersService.getByUserName(userName);
        const token = this.jwtService.sign(user, {
            secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
        });
        return token;
    }

    public async logout(token: string) {
        const payload: ITokenPayload = this.jwtService.verify(token, {
            secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
        });
        if (payload.userId) {
            const user = this.usersService.getById(payload.userId);
            // this.sessionService.updateSession(user.id, {})
        } else {
            throw new HttpException(`User not found `, HttpStatus.NOT_FOUND);
        }
        
    }

    public async getUserFromAuthenticationToken(token: string): Promise<IUser> {
        const payload: ITokenPayload = this.jwtService.verify(token, {
            secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
        });
        if (payload.userId) {
            return this.usersService.getById(payload.userId);
        } else {
            throw new HttpException(`User not found `, HttpStatus.NOT_FOUND);
        }
    }
}
