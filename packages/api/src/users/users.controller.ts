import { Controller,Get,Post,Body, Delete, Param, Query, Patch } from '@nestjs/common';
import {ApiTags, ApiOperation, ApiResponse,ApiParam, ApiQuery} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {QueryUserDto} from './dto/query-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    /**Create a new user */
    @Post()
    @ApiOperation({ summary:'Create a new user' })
    @ApiResponse({
        status:201,
        description:'User created successfully',
    })
    create (@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    /*All users */
    @Get()
    @ApiOperation({ summary:'Get all users' })
    @ApiQuery({name:'page',required:false})
    @ApiQuery({name:'limit',required:false})
    @ApiQuery({name:'search',required:false})
    @ApiQuery({name:'roleId',required:false})
    @ApiQuery({name:'status',required:false})
    @ApiQuery({name:'institutionId',required:false})

    @ApiResponse({
        status:200,
        description:'Users retrieved successfully',
    })
    findAll(@Query() queryUserDto: QueryUserDto) {
        return this.usersService.findAll(queryUserDto);
    }

    /*Get a user by id */
    @Get(':id')
    @ApiOperation({ summary:'Get a user by id' })
    @ApiParam({name:'id',required:true})
    @ApiResponse({
        status:200,
        description:'User retrieved successfully',
    })
    @ApiResponse({
        status:404,
        description:'User not found',
    })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    /*Update a user by id */
    @Patch(':id')
    @ApiOperation({ summary:'Update a user by id' })
    @ApiParam({name:'id',required:true})
    @ApiResponse({
        status:200,
        description:'User updated successfully',
    })
    @ApiResponse({
        status:404,
        description:'User not found',
    })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    /*Delete a user by id */
    @Delete(':id')
    @ApiOperation({ summary:'Delete a user by id' })
    @ApiParam({name:'id',required:true})
    @ApiResponse({
        status:200,
        description:'User deleted successfully',
    })
    @ApiResponse({
        status:404,
        description:'User not found',
    })
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
