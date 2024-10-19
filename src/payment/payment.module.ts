import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { EnvService } from '../env/env.service';

import { OrderModule } from '../order/order.module';
import { UserModule } from '../users/user.module';
import { EnvModule } from '../env/env.module';

@Module({
  imports: [OrderModule, UserModule, EnvModule],
  controllers: [PaymentController],
  providers: [PaymentService, EnvService],
})
export class PaymentModule {}
