import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';

const STAFF_ROLES = ['trainer', 'technical head', 'project head'];

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, is_deleted: false },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const userRoles = await this.prisma.userRole.findMany({
      where: { user_id: user.user_id },
      include: { role: true },
    });

    const roles = userRoles.map((ur) => ur.role.role_name);
    const payload = { sub: user.user_id, email: user.email, roles };

    return {
      access_token: this.jwt.sign(payload),
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        roles,
        account_status: user.account_status,
      },
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const hash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { user_id: userId },
      data: { password_hash: hash, account_status: 'APPROVED' },
    });
    return { success: true, account_status: 'APPROVED' };
  }

  async completeProfile(
    userId: number,
    roles: string[],
    dto: CompleteProfileDto,
  ) {
    const lowerRoles = roles.map((r) => r.toLowerCase());
    const isStudent = lowerRoles.includes('student');
    const isStaff = lowerRoles.some((r) => STAFF_ROLES.includes(r));

    await this.prisma.user.update({
      where: { user_id: userId },
      data: {
        full_name: dto.firstName,
        last_name: dto.lastName ?? '-',
        ...(dto.phone !== undefined && { phone: dto.phone }),
        account_status: 'ACTIVE',
      },
    });

    if (isStudent) {
      if (dto.institutionId) {
        // Upsert: create profile on first login, update on subsequent logins
        await this.prisma.studentProfile.upsert({
          where: { user_id: userId },
          create: {
            user_id: userId,
            institution_id: dto.institutionId,
            department: dto.department,
            academic_year: dto.academicYear,
            form_status: 'SUBMITTED',
          },
          update: {
            institution_id: dto.institutionId,
            ...(dto.department !== undefined && { department: dto.department }),
            ...(dto.academicYear !== undefined && {
              academic_year: dto.academicYear,
            }),
            form_status: 'SUBMITTED',
          },
        });
      } else {
        // No institution provided — only valid if profile already exists
        const existing = await this.prisma.studentProfile.findUnique({
          where: { user_id: userId },
        });
        if (!existing) {
          throw new BadRequestException(
            'Please select your institution to complete your profile.',
          );
        }
        await this.prisma.studentProfile.update({
          where: { user_id: userId },
          data: {
            ...(dto.department !== undefined && { department: dto.department }),
            ...(dto.academicYear !== undefined && {
              academic_year: dto.academicYear,
            }),
            form_status: 'SUBMITTED',
          },
        });
      }
    } else if (isStaff) {
      await this.prisma.employeeProfile.upsert({
        where: { user_id: userId },
        create: {
          user_id: userId,
          designation: dto.designation,
          specialization: dto.specialization,
          years_of_experience: dto.yearsOfExperience,
          joining_date: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
        },
        update: {
          ...(dto.designation !== undefined && {
            designation: dto.designation,
          }),
          ...(dto.specialization !== undefined && {
            specialization: dto.specialization,
          }),
          ...(dto.yearsOfExperience !== undefined && {
            years_of_experience: dto.yearsOfExperience,
          }),
          ...(dto.joiningDate !== undefined && {
            joining_date: new Date(dto.joiningDate),
          }),
        },
      });
    }

    return { success: true, account_status: 'ACTIVE' };
  }
}
