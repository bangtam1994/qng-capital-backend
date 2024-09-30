import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { UserService } from '../users/user.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private userService: UserService,
  ) {}

  @Post('checkout')
  async createCheckoutSession(
    @Body('userId') userId: number,
    @Body('amount') amount: number,
    @Body('currency') currency: string,
  ) {
    const user = await this.userService.findUserById(userId);
    if (!user) throw new Error('Cannot find user ');
    return this.paymentService.createCheckoutSession(user, amount, currency);
  }

  // handle payment confirmation after the user has successfully paid with a webhook that listens to Stripe events
  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    const event = body; // Parse the event

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await this.paymentService.handlePaymentSuccess(session.id);
        break;

      // Handle other events as necessary
      default:
        console.warn(`Unhandled event type ${event.type}`);
    }
  }
}
