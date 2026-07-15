import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AccountStatus, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

const STAFF_ROLES = ['trainer', 'technical head', 'project head'];

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createUserDto: CreateUserDto) {
        const { password, status, roleId, institutionId, last_name, roleName, ...rest } = createUserDto;
        const password_hash = await bcrypt.hash(password, 10);
        try {
            const user = await this.prisma.user.create({
                data: {
                    ...rest,
                    last_name:      last_name ?? '-',
                    password_hash,
                    account_status: (status ?? 'PENDING') as AccountStatus,
                },
            });

            const resolvedRoleName = roleName ?? (roleId ? undefined : undefined);
            if (resolvedRoleName) {
                const role = await this.prisma.role.findFirst({
                    where: { role_name: { equals: resolvedRoleName, mode: 'insensitive' } },
                });
                if (role) {
                    await this.prisma.userRole.create({
                        data: { user_id: user.user_id, role_id: role.role_id },
                    });

                    if (STAFF_ROLES.includes(resolvedRoleName.toLowerCase())) {
                        await this.prisma.employeeProfile.create({
                            data: { user_id: user.user_id, is_active: true },
                        });
                    }
                }
            }

            return user;
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new ConflictException('A user with this email already exists');
            }
            throw e;
        }
    }

    async findAll(queryUserDto: QueryUserDto) {
        const { page = 1, limit = 10, search, roleId, status, institutionId } = queryUserDto;
        const where: Prisma.UserWhereInput = {
            is_deleted: false,
            ...(search && {
                OR: [
                    { full_name: { contains: search, mode: 'insensitive' } },
                    { last_name: { contains: search, mode: 'insensitive' } },
                    { email:     { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(status && { account_status: status as AccountStatus }),
            ...(roleId && { userRoles: { some: { role_id: Number(roleId) } } }),
            ...(institutionId && { studentProfile: { institution_id: Number(institutionId) } }),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { created_at: 'desc' },
                select: {
                    user_id:        true,
                    full_name:      true,
                    last_name:      true,
                    email:          true,
                    phone:          true,
                    account_status: true,
                    created_at:     true,
                    userRoles: { select: { role: { select: { role_name: true } } } },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            success: true,
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { user_id: parseInt(id) },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return { success: true, data: user };
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        await this.findOne(id);
        const { password, status, roleId, institutionId, ...rest } = updateUserDto;
        const data: Prisma.UserUpdateInput = { ...rest };
        if (password) data.password_hash = await bcrypt.hash(password, 10);
        if (status) data.account_status = status as AccountStatus;
        const user = await this.prisma.user.update({
            where: { user_id: parseInt(id) },
            data,
        });
        return { success: true, message: 'User updated successfully', data: user };
    }

    async remove(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { user_id: parseInt(id) },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        await this.prisma.user.update({
            where: { user_id: parseInt(id) },
            data: { is_deleted: true, deleted_at: new Date() },
        });
        return { success: true, message: 'User deleted successfully' };
    }
}
