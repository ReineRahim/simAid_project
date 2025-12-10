import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserEntity } from '../../domain/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async listUsers(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async getUser(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { user_id: id } });
  }

  async createUser(payload: CreateUserDto): Promise<UserEntity> {
    const hashed = await bcrypt.hash(payload.password, 10);
    const entity = this.userRepository.create({
      full_name: payload.full_name,
      email: payload.email,
      password: hashed,
      role: payload.role || 'user',
    });
    return this.userRepository.save(entity);
  }

  async updateUser(id: number, payload: UpdateUserDto): Promise<UserEntity | null> {
    const existing = await this.getUser(id);
    if (!existing) return null;

    let updatedPassword = existing.password;
    if (payload.password) {
      updatedPassword = await bcrypt.hash(payload.password, 10);
    }

    const merged = this.userRepository.merge(existing, {
      ...payload,
      password: updatedPassword,
    });
    return this.userRepository.save(merged);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.userRepository.delete({ user_id: id });
    return (result.affected ?? 0) > 0;
  }
}
