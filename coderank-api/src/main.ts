import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppConfigService } from './config/app/app-config.service';

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
  
  const appConfig: AppConfigService = app.get(AppConfigService)
  	await app.listen(appConfig.port, appConfig.host, () => {
		console.log('-----------------------------------');
    console.log(`Application Name: ${appConfig.name}`);
    console.log(`Environment: ${appConfig.env}`);
    console.log(`Server running at: http://${appConfig.host}:${appConfig.port}/api`);
    console.log(`-----------------------------------`);
	});
}
bootstrap();
