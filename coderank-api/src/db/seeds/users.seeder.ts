import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { UsersEntity } from '../../modules/users/entities/user.entity';
import { AuthProvidersEntity } from '../../modules/users/entities/auth-provider.entity';
import { SessionsEntity } from '../../modules/users/entities/session.entity';
import {
  GenderEnum,
  RolesEnum,
  AuthProvidersEnum,
  SessionStatusEnum,
} from '../../common/enums/enums';

export async function seedUsers(dataSource: DataSource) {
  console.log('🌱 Seeding users...');

  const userRepo = dataSource.getRepository(UsersEntity);
  const authProviderRepo = dataSource.getRepository(AuthProvidersEntity);
  const sessionRepo = dataSource.getRepository(SessionsEntity);

  const users: UsersEntity[] = [];

  // Admin user
  const admin = userRepo.create({
    username: 'admin',
    fullName: 'Administrator',
    email: 'admin@coderank.com',
    avatarUrl: faker.image.avatar(),
    phoneNumber: '+84901234567',
    address: 'Hà Nội, Việt Nam',
    birthday: new Date('1990-01-01'),
    gender: GenderEnum.Male,
    roles: [RolesEnum.Admin, RolesEnum.Instructor, RolesEnum.ProblemSetter],
    rating: 100,
    eloRating: 2000,
    isActive: true,
    isEmailVerified: true,
    lastLoginAt: new Date(),
    loginAttempts: 0,
  });
  users.push(admin);

  // Instructors
  for (let i = 0; i < 5; i++) {
    const instructor = userRepo.create({
      username: `instructor${i + 1}`,
      fullName: faker.person.fullName(),
      email: `instructor${i + 1}@coderank.com`,
      avatarUrl: faker.image.avatar(),
      phoneNumber: faker.phone.number().substring(0, 20),
      address: faker.location.city() + ', Việt Nam',
      birthday: faker.date.birthdate({ min: 25, max: 50, mode: 'age' }),
      gender: faker.helpers.arrayElement(Object.values(GenderEnum)),
      roles: [RolesEnum.Instructor, RolesEnum.ProblemSetter],
      rating: faker.number.int({ min: 70, max: 100 }),
      eloRating: faker.number.int({ min: 1800, max: 2200 }),
      isActive: true,
      isEmailVerified: true,
      lastLoginAt: faker.date.recent({ days: 7 }),
      loginAttempts: 0,
    });
    users.push(instructor);
  }

  // Students
  for (let i = 0; i < 50; i++) {
    const student = userRepo.create({
      username: `student${i + 1}`,
      fullName: faker.person.fullName(),
      email: `student${i + 1}@coderank.com`,
      avatarUrl: faker.image.avatar(),
      phoneNumber: faker.phone.number().substring(0, 20),
      address: faker.location.city() + ', Việt Nam',
      birthday: faker.date.birthdate({ min: 18, max: 25, mode: 'age' }),
      gender: faker.helpers.arrayElement(Object.values(GenderEnum)),
      roles: [RolesEnum.Student],
      rating: faker.number.int({ min: 0, max: 100 }),
      eloRating: faker.number.int({ min: 1200, max: 1800 }),
      isActive: true,
      isEmailVerified: faker.datatype.boolean(),
      lastLoginAt: faker.date.recent({ days: 30 }),
      loginAttempts: 0,
    });
    users.push(student);
  }

  await userRepo.save(users);

  // Create auth providers for users
  const authProviders: AuthProvidersEntity[] = [];
  for (const user of users) {
    const provider = authProviderRepo.create({
      userId: user.id,
      provider: AuthProvidersEnum.Local,
      providerId: user.email,
      providerEmail: user.email,
      providerName: user.fullName,
      lastUsedAt: faker.date.recent({ days: 7 }),
    });
    authProviders.push(provider);
  }
  await authProviderRepo.save(authProviders);

  // Create active sessions for some users
  const sessions: SessionsEntity[] = [];
  const activeUsers = faker.helpers.arrayElements(users, 20);
  for (const user of activeUsers) {
    const session = sessionRepo.create({
      userId: user.id,
      sessionToken: faker.string.alphanumeric(64),
      refreshToken: faker.string.alphanumeric(64),
      ipAddress: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
      deviceName: faker.helpers.arrayElement(['MacBook Pro', 'Windows PC', 'iPhone', 'Android Phone']),
      status: SessionStatusEnum.Active,
      expiresAt: faker.date.future({ years: 1 }),
      lastActivityAt: faker.date.recent({ days: 1 }),
      isRemembered: faker.datatype.boolean(),
      deviceType: faker.helpers.arrayElement(['web', 'mobile', 'tablet', 'desktop']),
      browser: faker.helpers.arrayElement(['Chrome 120', 'Firefox 115', 'Safari 17']),
      os: faker.helpers.arrayElement(['Windows 11', 'macOS 14', 'Ubuntu 22.04', 'iOS 17', 'Android 14']),
    });
    sessions.push(session);
  }
  await sessionRepo.save(sessions);

  console.log(`✅ Created ${users.length} users, ${authProviders.length} auth providers, ${sessions.length} sessions`);
  return users;
}
