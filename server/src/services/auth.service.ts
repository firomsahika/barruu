import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { registerSchema, loginSchema, forgotPasswordSchema, updateProfileSchema, changePasswordSchema } from '../validations/auth.validation';

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

  static async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            articles: true,
            comments: true,
          }
        }
      }
    });

    if (!user) {
      throw new Error('Fayyadamaan hin argamne');
    }
    return user;
  }

  static async updateProfile(userId: string, data: z.infer<typeof updateProfileSchema>) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!existingUser) {
      throw new Error('Fayyadamaan hin argamne');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: data,
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
    return updatedUser;
  }

  static async getUserBookmark(userId: string) {

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      throw new Error('Fayyadamaan hin argamne');
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: userId },
      include: {
        article: {
          include: {
            author: { select: { id: true, name: true, username: true, avatarUrl: true } },
            tags: { include: { tag: true } },
            _count: { select: { reactions: true, comments: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return bookmarks;
  }

  static async getUserDraft(userId: string) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      throw new Error('Fayyadamaan hin argamne');
    }
    const drafts = await prisma.article.findMany({
      where: { authorId: userId, published: false },
      include: {
        tags: { include: { tag: true } },
        _count: { select: { reactions: true, comments: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return drafts;
  }

  static async forgotPassword(data: z.infer<typeof forgotPasswordSchema>) {
    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (!user) {
      // Throw error if user doesn't exist so the client knows
      throw new Error('FAYYADAMAAN_HIN_ARGAMNE'); // "User not found"
    }

    // 2. Hash the new password securely
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.newPassword, saltRounds);

    // 3. Update the password in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return { message: 'Password successfully updated' };
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

    const confirmNewPasswordMatch = await bcrypt.compare(data.newPassword, data.confirmNewPassword);

    if (!confirmNewPasswordMatch){
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


  static async getOtherProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            articles: true,
            comments: true,
          }
        }
      }
    });

    if (!user) {
      throw new Error('Fayyadamaan hin argamne');
    }
    return user;
  }

  private static generateToken(user: { id: string; email: string; role: string }) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
  }
}
