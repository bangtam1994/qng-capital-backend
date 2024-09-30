import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { User } from '../users/user.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async createOrder(
    user: User,
    amount: number,
    currency: string,
    status: OrderStatus,
  ): Promise<Order> {
    const order = this.orderRepository.create({
      user,
      amount,
      currency,
      status,
      createdAt: new Date(),
    });
    return this.orderRepository.save(order);
  }
}
