import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { seedUsers } from './users.seeder';
import { seedProblems } from './problems.seeder';
import { seedCourses } from './courses.seeder';
import { seedContests } from './contests.seeder';
import { seedAiFeatures } from './ai-features.seeder';

async function runSeeders() {
  console.log('🚀 Starting database seeding...\n');

  try {
    // Initialize database connection
    console.log('📦 Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    const entities = AppDataSource.entityMetadatas;

    // Disable foreign key checks
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const entity of entities) {
      const repository = AppDataSource.getRepository(entity.name);
      await repository.query(`TRUNCATE TABLE \`${entity.tableName}\``);
      console.log(`   Cleared ${entity.tableName}`);
    }

    // Re-enable foreign key checks
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Existing data cleared\n');

    // Run seeders in order (respecting foreign key dependencies)
    const users = await seedUsers(AppDataSource);
    console.log('');

    const { problems, tags } = await seedProblems(AppDataSource, users);
    console.log('');

    const courses = await seedCourses(AppDataSource, users, problems);
    console.log('');

    const contests = await seedContests(AppDataSource, users, problems);
    console.log('');

    // TODO: Fix ai-features seeder - có nhiều lỗi TypeScript với entity structure
    // await seedAiFeatures(AppDataSource, users, problems);
    // console.log('');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Problems: ${problems.length}`);
    console.log(`   - Tags: ${tags.length}`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Contests: ${contests.length}`);
    console.log('\n✨ Your database is now ready for testing!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\n📦 Database connection closed');
    }
  }
}

// Run the seeders
runSeeders();
