import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import dotenv from 'dotenv';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<INestApplication>(AppModule, {
    rawBody: true,
  });
  app.enableCors();
  dotenv.config();

  const port = process.env.PORT || 3100;

  await app.listen(port);
  console.log(`Application is running on: ${port}`);
}
bootstrap();
