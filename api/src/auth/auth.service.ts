import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserEntity } from '../domain/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  private toResponse(user: UserEntity) {
    const { password, ...rest } = user;
    return rest;
  }

  async register(payload: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { email: payload.email } });
    if (existing) {
      // Match Express style error surface
      throw new Error('Email already in use');
    }

    const hashed = await bcrypt.hash(payload.password, 10);
    const user = this.userRepository.create({
      full_name: payload.full_name,
      email: payload.email,
      password: hashed,
      role: payload.role || 'user',
    });
    const saved = await this.userRepository.save(user);
    return this.toResponse(saved);
  }

  async login(payload: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: payload.email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const match = await bcrypt.compare(payload.password, user.password);
    if (!match) {
      throw new Error('Invalid email or password');
    }

    const token = this.jwtService.sign({ sub: user.user_id, role: user.role });
    return {
      user: this.toResponse(user),
      token,
    };
  }

  async me(userId: number) {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new UnauthorizedException({ message: 'Invalid token' });
    }
    return this.toResponse(user);
  }
}
