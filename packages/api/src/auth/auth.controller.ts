import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login and receive JWT' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'First-time password change (sets account_status to APPROVED)' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() user: JwtPayload) {
    return this.authService.changePassword(user.sub, dto);
  }

  @Patch('complete-profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete onboarding profile (sets account_status to ACTIVE)' })
  @ApiResponse({ status: 200, description: 'Profile completed successfully' })
  completeProfile(@Body() dto: CompleteProfileDto, @CurrentUser() user: JwtPayload) {
    return this.authService.completeProfile(user.sub, user.roles, dto);
  }
}
