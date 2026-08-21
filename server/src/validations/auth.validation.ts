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
  currentPassword:z.string().min(6,'Jecha darbii ammaa galchaa'),
  newPassword:z.string().min(6, 'Jecha darbii waraabbii 6 caaluu qaba'),
  confirmNewPassword:z.string().min(6, 'Jecha darbii waraabbii 6 caaluu qaba'),
})

export const forgotPasswordSchema = z.object({
  email: z
    .string('Imeeliin ni barbaachisa')
    .email('Teessoo imeelii sirrii hin taane')
    .transform((val) => val.toLowerCase().trim()),
  newPassword: z
    .string('Jechi darbiinii ni barbaachisa')
    .min(6, 'Jechi darbiinii yoo xiqqaate arfiilee 6 ta\'uu qaba'),
});

export const updateProfileSchema = z.object({
  email:z.email().toLowerCase().trim(),'Email sirrii galchi ',
  name: z.string().min(2, 'Maqaan qubee 2 caaluu qaba'),
  username: z.string().min(3, 'Maqaan fayyadamaa qubee 3 caaluu qaba').regex(/^[a-zA-Z0-9_]+$/, 'Qubee, lakkoofsa fi _ qofa fayyadami'),
  bio: z.string().min(2, 'Bio qubee 2 caaluu qaba'),
  avatarUrl: z.string().url('Avatar URL sirrii hin taane'),
});
