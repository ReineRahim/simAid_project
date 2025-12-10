// Dev note: test with Postman -> POST /api/auth/register, POST /api/auth/login, GET /api/auth/me (Bearer token)
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiOkResponse({ type: Object })
  @Post('register')
  async register(@Body() payload: RegisterDto) {
    const user = await this.authService.register(payload);
    return user;
  }

 @ApiOperation({ summary: 'Login existing user' })
  @ApiOkResponse({ type: Object })
  @Post('login')
  async login(@Body() payload: LoginDto) {
    const { user, token } = await this.authService.login(payload);

    return {
      user: {
        ...user,
        id: user.user_id, 
      },
      token,
    };
  }


  @ApiOperation({ summary: 'Current user profile' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    const userId = (req as any)?.user?.userId ?? (req as any)?.user?.id;
    return this.authService.me(Number(userId));
  }
}
