import { Injectable,NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {QueryUserDto} from './dto/query-user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    /**Create a new user */
    async create(createUserDto: CreateUserDto) {
        return this.prisma.user.create({
            data: createUserDto
        });
    }

    /*Get all users */
    async findAll(queryUserDto: QueryUserDto) {
        const { page, limit, search, roleId, status, institutionId } = queryUserDto;
        return this.prisma.user.findMany({
            skip: (page - 1) * limit,
            take: limit,
            where: {
                firstName: { contains: search },
                lastName: { contains: search },
                email: { contains: search },
                roleId,
                status,
                institutionId
            }
        });
    }

    /*Get a user by id */
    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: {id}
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return {
            success:true,
            data:user,
        };
    }

    /*Update a user by id */
    async update(id: string, updateUserDto: UpdateUserDto) {
        await this.findOne(id);
        const user = await this.prisma.user.findUnique({
            where: { id }, data:updateUserDto
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return {
            success:true,
            message:'User updated successfully',
            data:user,
        }
    }

    /*Delete a user by id */
    async remove(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id }
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return {
            success:true,
            message:'User deleted successfully'
        }
    }
}
