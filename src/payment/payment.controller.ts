import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { UserService } from '../users/user.service';
// import { Product } from '../order/order.entity';
import { CreateSubscriptionDTO } from './payment.dto';
import { Request, Response } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private userService: UserService,
  ) {}

  @Post('subscription')
  async createSubscription(
    @Body()
    body: CreateSubscriptionDTO,
  ) {
    return this.paymentService.createSubscription(body);
  }

  // handle payment confirmation after the user has successfully paid with a webhook that listens to Stripe events
  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    return this.paymentService.handleWebook(req, res);
  }
}
