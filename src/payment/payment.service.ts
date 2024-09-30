import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';
import { EnvService } from '../env/env.service';
import { User } from '../users/user.entity';
import { OrderService } from '../order/order.service';
import { OrderStatus } from '../order/order.entity';
import { UserService } from '../users/user.service';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private envService: EnvService,
    private orderService: OrderService,
    private userService: UserService,
  ) {
    this.stripe = new Stripe(this.envService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-06-20',
    });
  }

  async createCheckoutSession(user: User, amount: number, currency: string) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: 'Your Offer Name',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://qngcapital.vercel.app`,
      cancel_url: `https://your-site.com/cancel`,
    });
    await this.orderService.createOrder(
      user,
      amount,
      currency,
      OrderStatus.PENDING,
    );
    return { url: session.url };
  }
  async handlePaymentSuccess(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    if (session && session.payment_status === 'paid') {
      const user = await this.getUserFromSession(); // Implement logic to get user
      if (!session.amount_total || !session.currency)
        throw new Error('Wrong amount or no currency found');
      await this.orderService.createOrder(
        user,
        session.amount_total,
        session.currency,
        OrderStatus.COMPLETED,
      );
    }
  }

  private async getUserFromSession(): Promise<User> {
    // Implement the logic to retrieve the user from the session or your database
    // This is just a placeholder
    const user = await this.userService.findByEmail(
      'bangtam.nguyen.1994@gmail.com',
    );
    if (!user) throw new Error('no user found');
    return user;
  }
}
