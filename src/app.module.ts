import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { envSchema } from './env/env';
import { ConfigModule } from '@nestjs/config';
import { EnvModule } from './env/env.module';
import { PaymentModule } from './payment/payment.module';
import { OrderModule } from './order/order.module';
import { PaymentService } from './payment/payment.service';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
    }),
    EnvModule,
    PaymentModule,
    OrderModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: true, // À utiliser en développement seulement
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PaymentService],
})
export class AppModule {}
