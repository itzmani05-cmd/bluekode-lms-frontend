import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ALLOWED_EMAILS_KEY } from '../decorators/allowed-emails.decorator';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AllowedEmailsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedEmails = this.reflector.getAllAndOverride<string[]>(
      ALLOWED_EMAILS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!allowedEmails || allowedEmails.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;
    const email = user?.email?.toLowerCase();

    if (!email || !allowedEmails.some((e) => e.toLowerCase() === email)) {
      throw new ForbiddenException(
        'You do not have permission to manage courses.',
      );
    }

    return true;
  }
}
