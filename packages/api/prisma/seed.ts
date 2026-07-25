import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // Ensure roles exist
  const roleNames = ['admin', 'trainer', 'technical head', 'project head', 'student'];
  for (const role_name of roleNames) {
    await prisma.role.upsert({
      where: { role_name },
      update: {},
      create: { role_name },
    });
  }

  const roles = await prisma.role.findMany();
  const roleMap = Object.fromEntries(roles.map((r: { role_name: string; role_id: number }) => [r.role_name, r.role_id]));

  // Seed users: [email, password, full_name, last_name, role_name]
  const users: [string, string, string, string, string][] = [
    ['admin@bluekode.com',    'Admin@12345',  'Admin',   'Bluekode', 'admin'],
    ['trainer@company.com',   'Train@12345',  'Trainer', 'User',     'trainer'],
    ['techhead@bluekode.com', 'Tech@12345',   'Tech',    'Head',     'technical head'],
    ['projhead@bluekode.com', 'Proj@12345',   'Project', 'Head',     'project head'],
    ['student@bluekode.com',  'Student@12345','Student', 'User',     'student'],
  ];

  for (const [email, password, full_name, last_name, role_name] of users) {
    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { full_name, last_name, email, password_hash, account_status: 'ACTIVE' },
    });

    const role_id = roleMap[role_name];
    if (role_id !== undefined) {
      await prisma.userRole.upsert({
        where: { user_id_role_id: { user_id: user.user_id, role_id } },
        update: {},
        create: { user_id: user.user_id, role_id },
      });
    }

    console.log(`✓ ${email} (${role_name})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
