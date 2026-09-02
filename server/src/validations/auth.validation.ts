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

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Jecha darbii ammaa galchaa'),
  newPassword: z.string().min(6, 'Jecha darbii waraabbii 6 caaluu qaba'),
  confirmNewPassword: z.string().min(6, 'Jecha darbii waraabbii 6 caaluu qaba'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string('Imeeliin ni barbaachisa')
    .email('Teessoo imeelii sirrii hin taane')
    .transform((val) => val.toLowerCase().trim()),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32, 'Mallattoo haaromsaa sirrii miti'),
  password: z.string().min(6, 'Jecha darbii haaraan qubee 6 caaluu qaba'),
  confirmPassword: z.string().min(6, 'Jecha darbii mirkaneessi'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Jechoonni darbii wal hin fakkaatan',
  path: ['confirmPassword'],
});

export const updateProfileSchema = z.object({
  email: z.string().email('Email sirrii galchi').toLowerCase().trim().optional(),
  name: z.string().min(2, 'Maqaan qubee 2 caaluu qaba').optional(),
  username: z
    .string()
    .min(3, 'Maqaan fayyadamaa qubee 3 caaluu qaba')
    .regex(/^[a-zA-Z0-9_]+$/, 'Qubee, lakkoofsa fi _ qofa fayyadami')
    .optional(),
  bio: z.union([
    z.string().trim().min(2, 'Bio qubee 2 caaluu qaba'),
    z.literal(''),
  ]).optional().transform((value) => value === '' ? '' : value),
  avatarUrl: z.union([
    z.string().url('Avatar URL sirrii hin taane'),
    z.literal(''),
  ]).optional().transform((value) => value === '' ? '' : value),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Yoo xiqqaate odeeffannoo tokko fooyyessi',
});
