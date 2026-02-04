import { AppDataSource } from "../data-source";

async function bootstrap() {
  await AppDataSource.initialize();
  console.log("DB connected");


  await AppDataSource.destroy();
  console.log("Seed completed");
}

bootstrap();
