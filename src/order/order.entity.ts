import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum Product {
  SMART_SIGNALS = 'SMART_SIGNALS',
  TRADING_ACADEMY = 'TRADING_ACADEMY',
  ELITE_PERFORMANCE = 'ELITE_PERFORMANCE',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column({ nullable: true })
  product: Product = Product.SMART_SIGNALS;

  @ManyToOne(() => User, (user) => user.orders)
  user?: User;

  @Column()
  amount: number = 0;

  @Column()
  currency: string = '€';

  @Column()
  status: OrderStatus = OrderStatus.COMPLETED;

  @Column()
  createdAt: Date = new Date();
}
