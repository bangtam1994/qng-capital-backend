import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import dotenv from 'dotenv';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  dotenv.config();
  app.use(
    '/payment/webhook',
    bodyParser.raw({ type: 'application/json' }), // Add raw body parser for the webhook
  );
  const port = process.env.PORT || 3100;

  await app.listen(port);
  console.log(`Application is running on: ${port}`);
}
bootstrap();
