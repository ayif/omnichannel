import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Role } from '../../common/role.enum';
import { User } from '../../database/entities/user.entity';
import { JwtPayload } from '../auth/jwt.strategy';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface UserSummary {
  id: string;
  email: string;
  nama: string;
  role: Role;
  createdAt: Date;
}

function toSummary(user: User): UserSummary {
  return {
    id: user.id,
    email: user.email,
    nama: user.nama,
    role: user.role,
    createdAt: user.createdAt,
  };
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findOne({ where: { email: dto.email } });
      if (existing) {
        throw new ConflictException('Email sudah dipakai user lain');
      }
      user.email = dto.email;
    }
    if (dto.nama) {
      user.nama = dto.nama;
    }

    await this.userRepo.save(user);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      nama: user.nama,
      role: user.role,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: payload,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Password saat ini salah');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.save(user);
    return { success: true };
  }

  async findAll(): Promise<UserSummary[]> {
    const users = await this.userRepo.find({ order: { createdAt: 'ASC' } });
    return users.map(toSummary);
  }

  async create(dto: CreateUserDto): Promise<UserSummary> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email sudah dipakai user lain');
    }

    const user = this.userRepo.create({
      nama: dto.nama,
      email: dto.email,
      passwordHash: await bcrypt.hash(dto.password, 10),
      role: dto.role,
    });
    await this.userRepo.save(user);
    return toSummary(user);
  }

  async update(id: string, dto: UpdateUserDto, actingUserId: string): Promise<UserSummary> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (id === actingUserId && dto.role && dto.role !== Role.ADMIN) {
      throw new ForbiddenException('Tidak bisa mengubah role akun sendiri');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findOne({ where: { email: dto.email } });
      if (existing) {
        throw new ConflictException('Email sudah dipakai user lain');
      }
      user.email = dto.email;
    }
    if (dto.nama) {
      user.nama = dto.nama;
    }
    if (dto.role) {
      user.role = dto.role;
    }

    await this.userRepo.save(user);
    return toSummary(user);
  }

  async remove(id: string, actingUserId: string): Promise<UserSummary> {
    if (id === actingUserId) {
      throw new ForbiddenException('Tidak bisa menghapus akun sendiri');
    }

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    await this.userRepo.remove(user);
    return toSummary(user);
  }
}
