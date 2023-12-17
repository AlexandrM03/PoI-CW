import { Body, Controller, Get, HttpCode, Post, Param, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @HttpCode(200)
    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return await this.authService.register(dto);
    }

    @HttpCode(200)
    @Post('login')
    async login(@Body() dto: LoginDto) {
        return await this.authService.login(dto);
    }

    @Put('activate/:code')
    async activate(@Param('code') code: string) {
        return await this.authService.activate(code);
    }

    @Get('resend/:email')
    async resendActivationCode(@Param('email') email: string) {
        return await this.authService.resendActivationCode(email);
    }
}
