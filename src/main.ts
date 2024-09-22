import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  dotenv.config();

  await app.listen(3100);
}
bootstrap();
