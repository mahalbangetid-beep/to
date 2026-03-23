import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profilesRepo: Repository<UserProfile>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { email: email.toLowerCase() },
      relations: ['profile'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { id },
      relations: ['profile'],
    });
  }

  async create(data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    role?: string;
  }): Promise<User> {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = this.usersRepo.create({
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role || 'user',
    });

    const savedUser = await this.usersRepo.save(user);

    // Create profile
    const profile = new UserProfile();
    profile.userId = savedUser.id;
    profile.name = data.name || null as any;
    profile.phone = data.phone || null as any;
    await this.profilesRepo.save(profile);

    // Return user with profile
    return this.findById(savedUser.id) as Promise<User>;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string },
  ): Promise<UserProfile> {
    let profile = await this.profilesRepo.findOne({ where: { userId } });

    if (!profile) {
      profile = this.profilesRepo.create({ userId, ...data });
    } else {
      if (data.name !== undefined) profile.name = data.name;
      if (data.phone !== undefined) profile.phone = data.phone;
    }

    return this.profilesRepo.save(profile);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new ConflictException('Password lama tidak sesuai');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await this.usersRepo.save(user);
  }

  async findAll(page = 1, limit = 20): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.usersRepo.findAndCount({
      relations: ['profile'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { users, total };
  }

  async findByResetToken(hashedToken: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { resetToken: hashedToken },
      relations: ['profile'],
    });
  }

  async save(user: User): Promise<User> {
    return this.usersRepo.save(user);
  }
}

