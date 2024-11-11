import {
  BadRequestException,
  Injectable,
  RawBodyRequest,
} from '@nestjs/common';
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

  async createOrderAndUser(createSubscriptionDTO: CreateSubscriptionDTO) {
    const { email, lastName, firstName, product, amount } =
      createSubscriptionDTO;
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
    return { orderCreation, userDb };
  }

  async handleWebook(req: RawBodyRequest<Request>, res: Response) {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = this.envService.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;
    if (!req.rawBody) return res.status(400).send('No request body');
    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        endpointSecret,
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err}`);
      throw new BadRequestException('Webhook error: ' + err);
    }
    // Handle the event

    switch (event.type) {
      // case 'payment_intent.succeeded':
      //   const paymentIntent = event.data.object as Stripe.PaymentIntent;

      //   // Call a method to handle the order creation

      //   await this.handlePaymentIntentSucceeded(paymentIntent);
      //   break;

      // Handle other event types here if needed
      // case 'invoice.paid':
      //   const invoice = event.data.object as Stripe.Invoice;
      //   console.log('Invoice was paid!', invoice);
      //   break;
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleSuccessfulCheckout(session);

      default:
        console.warn(`Unhandled event type: ${event.type}`);
    }
    res.status(200).json({ received: true });
  }

  async handleSuccessfulCheckout(session: Stripe.Checkout.Session) {
    const customerEmail = session.customer_email;
    const subscriptionId = session.subscription?.toString();
    const orderId = session.metadata?.orderId;
    const product = session.metadata?.productName || 'product ';
    const name = session.metadata?.firstName || 'User';

    if (!customerEmail || !subscriptionId) throw new Error('Email not found');
    // Update order in the database
    const orderEdit = await this.orderService.updateOrderStatus(
      Number(orderId),
      OrderStatus.COMPLETED,
    );

    // uPDATE ORDER IN DB USING THE SUBSCRIPTION ID NEWLY CREATED
    await this.orderService.updateOrder(Number(orderId), {
      stripeSubscriptionId: subscriptionId,
    });
    console.log('Order marked as COMPLETED.', orderEdit);
    // Send email to the user and owner
    await this.sendOrderConfirmationEmail(
      customerEmail,
      name,
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

  async createCheckoutSession({
    email,
    priceId,
    firstName,
    lastName,
    product,
    amount,
  }: CreateSubscriptionDTO): Promise<{ sessionId: string } | undefined> {
    try {
      // Create an order in db

      const result = await this.createOrderAndUser({
        email,
        priceId,
        firstName,
        lastName,
        product,
        amount,
      });
      const session = await this.stripe.checkout.sessions.create({
        // payment_method_types: ['card', 'google_pay', 'apple_pay'],
        mode: 'subscription',
        customer_email: email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${this.envService.get('FRONTEND_URL')}/payment-status?status=success&session_id={CHECKOUT_SESSION_ID}&product=${product}`,
        cancel_url: `${this.envService.get('FRONTEND_URL')}/payment-status?status=cancel&session_id={CHECKOUT_SESSION_ID}&product=${product}`,
        metadata: {
          userEmail: email,
          firstName,
          lastName,
          productName: product,
          orderId: result.orderCreation.id,
        },
      });

      return { sessionId: session.id };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Unable to create checkout session');
    }
  }

  async getCheckoutSessionDetails(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      console.error('Error fetching session details:', error);
      throw new Error('Unable to retrieve session details');
    }
  }

  // ------------------------ NOT USED------------------------------

  async createPaymentIntent({
    paymentMethod,
    amount,
    currency,
  }: {
    paymentMethod: string;
    amount: number;
    currency: string;
  }): Promise<{ clientSecret: string } | undefined> {
    try {
      // Create the PaymentIntent with the necessary parameters
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        payment_method: paymentMethod,
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
        setup_future_usage: 'off_session',
      });

      // Return the client_secret to the controller
      if (paymentIntent.client_secret)
        return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      console.error('Error creating PaymentIntent:', error);
      throw new Error('Failed to create PaymentIntent');
    }
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

  async createSubscription(createSubscriptionDTO: CreateSubscriptionDTO) {
    // Create a user and an order
    const { email, lastName, firstName, priceId, paymentMethod, product } =
      createSubscriptionDTO;
    const { orderCreation, userDb } = await this.createOrderAndUser(
      createSubscriptionDTO,
    );

    // create a stripe customer
    const customer = await this.stripe.customers.create({
      name: `${firstName} ${lastName}`,
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
      default_payment_method: paymentMethod,
      payment_settings: {
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
        {
          stripeSubscriptionId: subscription.id,
          status: OrderStatus.COMPLETED,
        },
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
}
