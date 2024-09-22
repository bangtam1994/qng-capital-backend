import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}
