import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().optional().default(3100),
  DATABASE_URL: z.coerce
    .string()
    .default('postgres://postgres@localhost:5432/qng'),
  EMAIL_USER: z.coerce.string().default('contact@qngcapital.com'),
  EMAIL_PASS: z.coerce.string(),
  STRIPE_SECRET_KEY: z.coerce.string(),
  FRONTEND_URL: z.coerce.string(),
});
export type Env = z.infer<typeof envSchema>;
