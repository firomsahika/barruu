import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email sirrii galchaa'),
  username: z.string().min(3, 'Maqaan fayyadamaa qubee 3 caaluu qaba').regex(/^[a-zA-Z0-9_]+$/, 'Qubee, lakkoofsa fi _ qofa fayyadami'),
  name: z.string().min(2, 'Maqaan qubee 2 caaluu qaba'),
  password: z.string().min(6, 'Jecha darbii waraabbii 6 caaluu qaba'),
});

export const loginSchema = z.object({
  email: z.string().email('Email sirrii galchaa'),
  password: z.string().min(1, 'Jecha darbii galchaa'),
});
