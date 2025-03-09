import { z } from 'zod';
import { Product } from '../order/order.entity';

export const createSubscriptionDTO = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email('Invalid email format'),
  paymentMethod: z.string().optional(),
  priceId: z.string(),
  product: z.enum([
    Product.FORMATION_HTC,
    Product.LE_CLUB_PRIVE,
    Product.MENTORAT,
  ]),
  amount: z.number(),
});

export type CreateSubscriptionDTO = z.infer<typeof createSubscriptionDTO>;
