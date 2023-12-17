import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hash, verify } from 'argon2';
import { RegisterDto } from './dto/register.dto';
import * as nodemailer from 'nodemailer';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtServise: JwtService,
        private configService: ConfigService
    ) { }

    async register(dto: RegisterDto) {
        try {
            const oldUser = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        { email: dto.email },
                        { username: dto.username }
                    ]
                }
            });

            if (oldUser) {
                throw new BadRequestException('User already exists');
            }

            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    username: dto.username,
                    password: await hash(dto.password)
                }
            });

            await this.sendActivationEmail(dto.email, user.activationCode);

            return user;
        } catch (e) {
            throw new BadRequestException(e.message);
        }
    }

    async login(dto: LoginDto) {
        const user = await this.validateUser(dto.identifier, dto.password);
        const token = await this.issueToken(user.id, user.roleId);

        return {
            user: this.returnUserFields(user),
            ...token
        };
    }

    async activate(activationCode: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                activationCode
            }
        });

        if (!user) {
            throw new NotFoundException('Activation code not found');
        }

        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                activationCode: null
            }
        });

        const token = await this.issueToken(user.id, user.roleId);

        return {
            user: this.returnUserFields(user),
            ...token
        };
    }

    async resendActivationCode(email: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                email
            }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.sendActivationEmail(email, user.activationCode);

        return user;
    }

    private async sendActivationEmail(email: string, activationCode: string) {
        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.inbox.ru',
                port: 587,
                secure: false,
                auth: {
                    user: this.configService.get('SMTP_USER'),
                    pass: this.configService.get('SMTP_PASSWORD')
                }
            });

            const mailOptions = {
                from: this.configService.get('SMTP_USER'),
                to: email,
                subject: 'Account activation',
                html: `
                <h1>Wellcome to CodePilot!</h1>
                <p>Your activation code: <b>${activationCode}</b></p>
            `
            }

            await transporter.sendMail(mailOptions);
        } catch (e) {
            throw new BadRequestException('Something went wrong during sending email');
        }
    }

    private async issueToken(userId: string, roleId: string) {
        const payload = { id: userId, roleId };
        return {
            access_token: this.jwtServise.sign(payload, {
                expiresIn: this.configService.get('JWT_EXPIRATION_TIME')
            })
        }
    }

    private async validateUser(identifier: string, password: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: identifier }
                ]
            }
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await verify(user.password, password);
        if (!isPasswordValid) {
            throw new NotFoundException('Wrong password');
        }

        if (user.activationCode != null) {
            throw new BadRequestException('Please check your email to activate your account');
        }

        return user;
    }

    private returnUserFields(user: User) {
        return {
            username: user.username,
            avatarId: user.avatarId,
            id: user.id,
            roleId: user.roleId
        }
    }
}
