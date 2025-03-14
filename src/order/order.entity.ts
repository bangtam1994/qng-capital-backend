import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// export enum Product {
//   SMART_SIGNALS = 'smart_signals',
//   TRADING_ACADEMY = 'trading_academy',
//   ELITE_PERFORMANCE = 'elite_performance',
// }
export enum Product {
  FORMATION_HTC = 'formation_htc',
  LE_CLUB_PRIVE = 'le_club_prive',
  MENTORAT = 'mentorship',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column({ nullable: true })
  product: Product = Product.FORMATION_HTC;

  @ManyToOne(() => User, (user) => user.orders)
  user?: User;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  amount: number = 0;

  @Column()
  currency?: string = '€';

  @Column()
  stripeSubscriptionId?: string = '';

  @Column()
  status: OrderStatus = OrderStatus.COMPLETED;

  @Column()
  createdAt: Date = new Date();
}
