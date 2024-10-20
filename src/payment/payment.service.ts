import { BadRequestException, Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';
import { EnvService } from '../env/env.service';
import { OrderService } from '../order/order.service';

import { UserService } from '../users/user.service';
import { CreateSubscriptionDTO } from './payment.dto';
import { OrderStatus } from '../order/order.entity';
import { Request, Response } from 'express';
import { createOrderDTO } from '../order/order.dto';
import nodemailer from 'nodemailer';
import { emailSmartSignals } from './emails';
import path from 'path';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private envService: EnvService,
    private orderService: OrderService,
    private userService: UserService,
  ) {
    const stripeSecretKey = this.envService.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key is not defined.');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
    });
  }

  async createSubscription(createSubscriptionDTO: CreateSubscriptionDTO) {
    // Create a user and an order
    const {
      email,
      lastName,
      firstName,
      priceId,
      paymentMethod,
      product,
      amount,
    } = createSubscriptionDTO;
    let userDb;
    const user = await this.userService.findByEmail(email);
    if (!user) {
      const newUser = await this.userService.create({
        email,
        firstName,
        lastName,
      });
      userDb = newUser;
    } else {
      console.log('User found. Skipping user creation');
      userDb = user;
      await this.userService.updateUser(user.id, { firstName, lastName });
    }

    const orderDTO: createOrderDTO = {
      user: userDb,
      stripeSubscriptionId: '',
      amount,
      status: OrderStatus.PENDING,
      product,
    };

    const orderCreation = await this.orderService.createOrder(orderDTO);
    console.log('order created : ', orderCreation);

    // create a stripe customer
    const customer = await this.stripe.customers.create({
      name: firstName + ' ' + lastName,
      email: email,
      metadata: { productName: product },
      payment_method: paymentMethod,
      invoice_settings: {
        default_payment_method: paymentMethod,
      },
    });
    // create a stripe subscription
    const subscription = await this.stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      metadata: {
        orderId: orderCreation.id,
        userEmail: email,
        productName: product.toString(),
      },
      payment_settings: {
        payment_method_options: {
          card: {
            request_three_d_secure: 'any',
          },
        },
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    const latestInvoice = subscription?.latest_invoice;

    if (
      latestInvoice &&
      typeof latestInvoice === 'object' &&
      'payment_intent' in latestInvoice
    ) {
      const paymentIntent =
        latestInvoice.payment_intent as Stripe.PaymentIntent;

      await this.stripe.paymentIntents.update(paymentIntent.id, {
        metadata: {
          orderId: orderCreation.id,
          userEmail: email,
          firstName,
          lastName,
          productName: product,
          subscriptionId: subscription.id,
        },
      });

      // Update Order & User in db
      const orderEditSubscriptionId = await this.orderService.updateOrder(
        orderCreation.id,
        { stripeSubscriptionId: subscription.id },
      );

      await this.userService.addOrderToUser(userDb.id, orderEditSubscriptionId);

      // return the client secret and subscription id
      return {
        clientSecret: paymentIntent.client_secret,
        subscriptionId: subscription.id,
      };
    } else {
      throw new Error('Failed to retrieve payment intent.');
    }
  }

  async handleWebook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = this.envService.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;
    if (!req.body) return res.status(400).send('No request body');
    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret,
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err}`);
      throw new BadRequestException('Webhook error: ' + err);
    }
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Call a method to handle the order creation

        await this.handlePaymentIntentSucceeded(paymentIntent);
        break;

      // Handle other event types here if needed
      case 'invoice.paid':
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice was paid!', invoice);
        break;

      default:
        console.warn(`Unhandled event type: ${event.type}`);
    }
    res.json({ received: true });
  }

  async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const userEmail = paymentIntent.metadata.userEmail;
    const subscriptionId = paymentIntent.metadata.subscriptionId;
    const product = paymentIntent.metadata.productName;

    // Update order in the database
    const orderEdit = await this.orderService.updateOrderStatus(
      Number(paymentIntent.metadata.orderId),
      OrderStatus.COMPLETED,
    );
    console.log('Order marked as COMPLETED.', orderEdit);
    // Send email to the user and owner
    await this.sendOrderConfirmationEmail(
      userEmail,
      paymentIntent.metadata.firstName,
      subscriptionId,
      product,
    );
  }

  private async sendOrderConfirmationEmail(
    userEmail: string,
    userName: string,
    subscriptionId: string,
    product: string,
  ) {
    const transporter = nodemailer.createTransport({
      host: 'ssl0.ovh.net',
      port: 465,
      secure: true,
      auth: {
        user: this.envService.get('EMAIL_USER'),
        pass: this.envService.get('EMAIL_PASS'),
      },
    });

    console.log(
      `Sending order confirmation to ${userEmail} ${userName} for subscription ${subscriptionId}, product ${product}`,
    );
    const imagePath = path.resolve(process.cwd(), 'images/logo_qng.png');

    const emailContent = emailSmartSignals(userName);

    const mailOptions = {
      from: `QNG Capital <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Thank you for joining the Smart Trader Team! ',
      html: emailContent,
      attachments: [
        {
          filename: 'logo.png',
          path: imagePath,
          cid: 'logo',
        },
      ],
    };
    await transporter.sendMail(mailOptions);

    const mailToNotifyMeOptions = {
      from: `Automatic notifier <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Someone paid an offer! ',
      text: `User ${userName} with email ${userEmail} has paid an offer, ${subscriptionId}, product ${product}`,
    };
    await transporter.sendMail(mailToNotifyMeOptions);

    console.log(`Email sent ! `);
  }
}
