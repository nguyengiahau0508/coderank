import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as path from 'path';
import { AppConfigService } from './config/app/app-config.service';
import { MariadbConfigService } from './config/db/mariadb/mariadb-config.service';
import { COLORS } from './common/constants/colors';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig, swaggerCustomOptions } from './config/swagger';
import { GlobalExceptionFilter } from './common/filters';
import { TransformInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['debug', 'fatal', 'error', 'warn', 'verbose', 'log'],
  });

  const reflector = app.get(Reflector);

  // Serve uploaded files statically at /api/files
  app.useStaticAssets(path.resolve(process.cwd(), 'uploads'), {
    prefix: '/api/files/',
  });

  app.use(cookieParser());
  app.use(helmet());
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:4000',
    ],
    credentials: true
  });


  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties not in DTO
    transform: true, // Auto-transform payloads
    forbidNonWhitelisted: true, // Throw error for unknown properties
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  const appConfig: AppConfigService = app.get(AppConfigService);
  const mariadbConfig: MariadbConfigService = app.get(MariadbConfigService);

  // Setup Swagger Documentation
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });
  SwaggerModule.setup('api-docs', app, document, swaggerCustomOptions);

  await app.listen(appConfig.port, appConfig.host, () => {
    const border = `${COLORS.cyan}-----------------------------------${COLORS.reset}`;
    console.log(border);
    console.log(`${COLORS.bright}${COLORS.cyan}Application Info:${COLORS.reset}`);
    console.log(`${COLORS.bright}${COLORS.green}Application Name:${COLORS.reset} ${COLORS.yellow}${appConfig.name}${COLORS.reset}`);
    console.log(`${COLORS.bright}${COLORS.green}Environment:${COLORS.reset} ${COLORS.magenta}${appConfig.env}${COLORS.reset}`);
    console.log(`${COLORS.bright}${COLORS.green}Server running at:${COLORS.reset} ${COLORS.blue}http://${appConfig.host}:${appConfig.port}/api${COLORS.reset}`);
    console.log(border);
    console.log(`${COLORS.bright}${COLORS.cyan}API Documentation:${COLORS.reset}`);
    console.log(`${COLORS.green}Swagger UI:${COLORS.reset} ${COLORS.blue}http://${appConfig.host}:${appConfig.port}/api-docs${COLORS.reset}`);
    console.log(border);
    console.log(`${COLORS.bright}${COLORS.cyan}Database Connection:${COLORS.reset}`);
    console.log(`${COLORS.green}Type:${COLORS.reset} ${COLORS.yellow}MariaDB${COLORS.reset}`);
    console.log(`${COLORS.green}Host:${COLORS.reset} ${COLORS.yellow}${mariadbConfig.host}${COLORS.reset}`);
    console.log(`${COLORS.green}Port:${COLORS.reset} ${COLORS.yellow}${mariadbConfig.port}${COLORS.reset}`);
    console.log(`${COLORS.green}Database:${COLORS.reset} ${COLORS.yellow}${mariadbConfig.dbName}${COLORS.reset}`);
    console.log(`${COLORS.green}Username:${COLORS.reset} ${COLORS.yellow}${mariadbConfig.username}${COLORS.reset}`);

  });
}
bootstrap();
