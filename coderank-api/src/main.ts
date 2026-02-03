import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppConfigService } from './config/app/app-config.service';
import { MariadbConfigService } from './config/db/mariadb/mariadb-config.service';
import { COLORS } from './common/constants/colors';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['fatal','error', 'warn', 'debug', 'verbose'],
  });

  app.use(cookieParser());
  app.use(helmet());
  app.enableCors({
    origin: [
      'http://localhost:4200',
    ],
    credentials: true
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  
  const appConfig: AppConfigService = app.get(AppConfigService);
  const mariadbConfig: MariadbConfigService = app.get(MariadbConfigService);

  await app.listen(appConfig.port, appConfig.host, () => {
    const border = `${COLORS.cyan}-----------------------------------${COLORS.reset}`;
    console.log('\n' + border);
    console.log(`${COLORS.bright}${COLORS.cyan}Application Info:${COLORS.reset}`);
    console.log(`${COLORS.bright}${COLORS.green}Application Name:${COLORS.reset} ${COLORS.yellow}${appConfig.name}${COLORS.reset}`);
    console.log(`${COLORS.bright}${COLORS.green}Environment:${COLORS.reset} ${COLORS.magenta}${appConfig.env}${COLORS.reset}`);
    console.log(`${COLORS.bright}${COLORS.green}Server running at:${COLORS.reset} ${COLORS.blue}http://${appConfig.host}:${appConfig.port}/api${COLORS.reset}`);
    console.log(border);
    console.log(`${COLORS.bright}${COLORS.cyan}Database Connection:${COLORS.reset}`);
    console.log(`${COLORS.green}Type:${COLORS.reset} ${COLORS.yellow}MariaDB${COLORS.reset}`);
    console.log(`${COLORS.green}Host:${COLORS.reset} ${COLORS.yellow}${mariadbConfig.host}${COLORS.reset}`);
    console.log(`${COLORS.green}Port:${COLORS.reset} ${COLORS.yellow}${mariadbConfig.port}${COLORS.reset}`);
    console.log(`${COLORS.green}Database:${COLORS.reset} ${COLORS.yellow}${mariadbConfig.dbName}${COLORS.reset}`);
    console.log(`${COLORS.green}Username:${COLORS.reset} ${COLORS.yellow}${mariadbConfig.username}${COLORS.reset}`);
    console.log(border + '\n');
  });
}
bootstrap();
