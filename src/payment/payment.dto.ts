import { z } from 'zod';
import { Product } from '../order/order.entity';

export const createSubscriptionDTO = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email('Invalid email format'),
  paymentMethod: z.string().optional(),
  priceId: z.string(),
  product: z.enum([
    Product.SMART_SIGNALS,
    Product.ELITE_PERFORMANCE,
    Product.TRADING_ACADEMY,
  ]),
  amount: z.number(),
});

export type CreateSubscriptionDTO = z.infer<typeof createSubscriptionDTO>;
