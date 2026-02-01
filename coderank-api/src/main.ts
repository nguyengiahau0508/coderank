import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.use(helmet());
  app.enableCors({
    origin: [
      'http://localhost:4200',
    ],
    credentials: true
  });

  app.setGlobalPrefix('api');
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
