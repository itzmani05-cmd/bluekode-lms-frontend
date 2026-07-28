import { SetMetadata } from '@nestjs/common';

export const ALLOWED_EMAILS_KEY = 'allowedEmails';
export const AllowedEmails = (...emails: string[]) =>
  SetMetadata(ALLOWED_EMAILS_KEY, emails);
