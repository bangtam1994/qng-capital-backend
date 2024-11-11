import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  RawBodyRequest,
} from '@nestjs/common';
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

  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body()
    body: CreateSubscriptionDTO,
  ) {
    return this.paymentService.createCheckoutSession(body);
  }

  // handle payment confirmation after the user has successfully paid with a webhook that listens to Stripe events
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    return this.paymentService.handleWebook(req, res);
  }

  @Post('checkout-session-details')
  async getCheckoutSessionDetails(@Body() body: { sessionId: string }) {
    const { sessionId } = body;

    // Fetch the session details using the StripeService
    const session =
      await this.paymentService.getCheckoutSessionDetails(sessionId);

    if (session.payment_status === 'paid') {
      return {
        success: true,
        message: 'Payment was successful!',
        session,
      };
    } else {
      return {
        success: false,
        message: 'Payment failed or was canceled.',
        session,
      };
    }
  }

  // ------------------------ NOT USED------------------------------

  @Post('subscription')
  async createSubscription(
    @Body()
    body: CreateSubscriptionDTO,
  ) {
    return this.paymentService.createSubscription(body);
  }

  @Post('create-payment-intent')
  async createExpressCheckout(
    @Body()
    body: {
      paymentMethod: string;
      amount: number;
      currency: string;
    },
  ) {
    return this.paymentService.createPaymentIntent(body);
  }
}
