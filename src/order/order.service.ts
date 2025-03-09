import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { createOrderDTO } from './order.dto';
import { User } from '../users/user.entity';
import { DeepPartial } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async createOrder(createOrderBody: createOrderDTO): Promise<Order> {
    const { user, amount, currency, status, product, stripeSubscriptionId } =
      createOrderBody;
    const order = this.orderRepository.create({
      amount,
      currency,
      status,
      product,
      stripeSubscriptionId,
      createdAt: new Date(),
    } as DeepPartial<Order>);
    order.user = user as User;
    const savedOrder = await this.orderRepository.save(order);
    return savedOrder;
  }

  async findByStripeId(id: string): Promise<Order | null> {
    const order = await this.orderRepository.findOne({
      where: { stripeSubscriptionId: id },
    });
    return order;
  }

  async findOrderById(id: number): Promise<Order | null> {
    return this.orderRepository.findOne({ where: { id } });
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    const order = await this.findOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    await this.orderRepository.update(orderId, { status });
    return order;
  }

  async updateOrder(orderId: number, body: Partial<Order>) {
    const order = await this.findOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    await this.orderRepository.update(orderId, body);
    return order;
  }
}
