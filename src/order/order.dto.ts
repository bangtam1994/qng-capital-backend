import { z } from 'zod';
import { OrderStatus, Product } from './order.entity';

export const createOrderDTO = z.object({
  user: z.object({ id: z.number() }),
  amount: z.number().positive(),
  currency: z.string().optional(),
  status: z.enum([
    OrderStatus.COMPLETED,
    OrderStatus.FAILED,
    OrderStatus.PENDING,
  ]),
  stripeSubscriptionId: z.string(),
  product: z.enum([
    Product.FORMATION_HTC,
    Product.LE_CLUB_PRIVE,
    Product.MENTORAT,
  ]),
});

export type createOrderDTO = z.infer<typeof createOrderDTO>;
