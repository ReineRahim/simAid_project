import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../../auth/auth.service';
import { LoginDto } from '../../auth/dto/login.dto';
import { RegisterDto } from '../../auth/dto/register.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserIdParamDto } from './dto/user-id-param.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Legacy alias for /auth/register.
   */
  @ApiOperation({ summary: 'Register (alias to /auth/register)' })
  @ApiCreatedResponse({ type: Object })
  @Post('register')
  async register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  /**
   * Legacy alias for /auth/login.
   */
  @ApiOperation({ summary: 'Login (alias to /auth/login)' })
  @ApiOkResponse({ type: Object })
  @Post('login')
  async login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @ApiOperation({ summary: 'List users (admin)' })
  @ApiOkResponse({ type: Object, isArray: true })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async list() {
    return this.usersService.listUsers();
  }

  @ApiOperation({ summary: 'Get user by id (admin)' })
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  async getById(@Param() params: UserIdParamDto) {
    const user = await this.usersService.getUser(params.id);
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }
    return user;
  }

  @ApiOperation({ summary: 'Create user (admin)' })
  @ApiCreatedResponse({ type: Object })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() payload: CreateUserDto) {
    return this.usersService.createUser(payload);
  }

  @ApiOperation({ summary: 'Update user (admin)' })
  @ApiOkResponse({ type: Object })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(@Param() params: UserIdParamDto, @Body() payload: UpdateUserDto) {
    const user = await this.usersService.updateUser(params.id, payload);
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }
    return user;
  }

  @ApiOperation({ summary: 'Delete user (admin)' })
  @ApiNoContentResponse()
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() params: UserIdParamDto) {
    const ok = await this.usersService.deleteUser(params.id);
    if (!ok) {
      throw new NotFoundException({ message: 'User not found' });
    }
  }
}
