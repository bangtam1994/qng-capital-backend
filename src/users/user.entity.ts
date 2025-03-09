import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Order, Product } from '../order/order.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  firstName: string = '';

  @Column()
  lastName: string = '';

  @Column({ unique: true })
  email: string = '';

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();

  @Column({ default: false })
  ebookSent: boolean = false;

  @OneToMany(() => Order, (order) => order.user)
  orders?: Order[];

  @Column({ nullable: true })
  product?: Product = Product.FORMATION_HTC;
}
