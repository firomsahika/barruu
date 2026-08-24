import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../validations/auth.validation';

export class AuthService {
  static async register(data: z.infer<typeof registerSchema>) {
    const { email, username, name, password } = data;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existing) {
      throw new Error('Email ykn maqaa fayyadamaa kun dursee jira');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        username: username.toLowerCase().replace(/\\s+/g, '_'),
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      }
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  static async login(data: z.infer<typeof loginSchema>) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Email ykn jecha darbii hin sirre');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Email ykn jecha darbii sirrii miti!');
    }

    const token = this.generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  static async forgotPassword(data: z.infer<typeof forgotPasswordSchema>) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });
    // Do not reveal whether the email exists.
    if (!user) return { message: 'If the account exists, reset instructions were sent.' };

    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.$executeRaw`UPDATE "users" SET "resetTokenHash" = ${tokenHash}, "resetTokenExpiresAt" = ${expiresAt} WHERE "id" = ${user.id}`;

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    await this.deliverResetLink({ email: user.email, resetUrl });

    // This makes local development testable without leaking reset tokens in production.
    if (process.env.NODE_ENV !== 'production') return { message: 'If the account exists, reset instructions were sent.', resetToken: token };
    return { message: 'If the account exists, reset instructions were sent.' };
  }

  static async resetPassword(data: z.infer<typeof resetPasswordSchema>) {
    const tokenHash = this.hashResetToken(data.token);
    const users = await prisma.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "users" WHERE "resetTokenHash" = ${tokenHash} AND "resetTokenExpiresAt" > NOW() LIMIT 1`;
    const user = users[0];
    if (!user) throw new Error('RESET_TOKEN_INVALID');

    const password = await bcrypt.hash(data.password, 12);
    await prisma.$executeRaw`UPDATE "users" SET "password" = ${password}, "resetTokenHash" = NULL, "resetTokenExpiresAt" = NULL WHERE "id" = ${user.id}`;
    return { message: 'Jechi darbii kee haaromfame.' };
  }

  private static hashResetToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private static async deliverResetLink({ email, resetUrl }: { email: string; resetUrl: string }) {
    const webhookUrl = process.env.PASSWORD_RESET_WEBHOOK_URL;
    if (!webhookUrl) {
      if (process.env.NODE_ENV !== 'production') console.info(`Password reset link for ${email}: ${resetUrl}`);
      else throw new Error('Password reset delivery is not configured');
      return;
    }
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(process.env.PASSWORD_RESET_WEBHOOK_SECRET ? { Authorization: `Bearer ${process.env.PASSWORD_RESET_WEBHOOK_SECRET}` } : {}) },
      body: JSON.stringify({ email, resetUrl }),
    });
    if (!response.ok) throw new Error('Password reset delivery failed');
  }

  static async changePassword(userId:string, data:z.infer<typeof changePasswordSchema>){
    const existingUser = await prisma.user.findUnique({
      where:{
        id:userId
      }
    });

    if(!existingUser){
      throw new Error ("User not found!")
    }

    const isPasswordValid = await bcrypt.compare(data.currentPassword, existingUser.password);

    if(!isPasswordValid){
      throw new Error ("Invalid old password!");
    }

    if (data.newPassword !== data.confirmNewPassword){
      throw new Error("New password and confirm new password do not match!")
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.newPassword,saltRounds);
 
    await prisma.user.update({
      where:{id:userId},
      data:{password:hashedPassword}
    });

    return {message:"Password changed successfully!"}
  }


  private static generateToken(user: { id: string; email: string; role: string }) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '7d' }
    );
  }
}
