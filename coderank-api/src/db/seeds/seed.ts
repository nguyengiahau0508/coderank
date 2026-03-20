import { AppDataSource } from '../data-source';
import { ProblemSeeder } from './seeders/problems.seeder';

async function bootstrap() {
  await AppDataSource.initialize();
  console.log('DB connected');

  await new ProblemSeeder().run();

  await AppDataSource.destroy();
  console.log('Seed completed');
}

bootstrap();
