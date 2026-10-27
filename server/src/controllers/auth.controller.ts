import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validations/auth.validation';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../lib/logger';

export class AuthController {
  static async me(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Hin seenin' });
        return;
      }
      const user = await UserService.me(userId);
      res.json(user);
    } catch (error: any) {
      logger.error({ err: error, route: req.path }, 'Me error');
      res.status(404).json({ error: error.message || 'Fayyadamaan hin argamne' });
    }
  }

  static async register(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await AuthService.register(validatedData);
      res.status(201).json(result);
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        res.status(400).json({ error: error.errors[0]?.message || 'Galmeen sirrii miti' });
        return;
      }
      logger.error({ err: error, route: req.path }, 'Register error');
      res.status(400).json({ error: error.message || 'Dogoggora serverii' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedData);
      res.json(result);
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        res.status(400).json({ error: error.errors[0]?.message || 'Galmeen sirrii miti' });
        return;
      }
      logger.error({ err: error, route: req.path }, 'Login error');
      if (
        error.message === 'Email ykn jecha darbii hin sirre' ||
        error.message === 'Email ykn jecha darbii sirrii miti!'
      ) {
        res.status(401).json({ error: 'Email ykn jecha darbii sirrii miti.' });
        return;
      }
      res.status(500).json({ error: 'Dogoggora serverii' });
    }
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      const result = await AuthService.forgotPassword(validatedData);

      res.status(200).json({
        ...result,
        message: 'Ergaaniiyyuu yoo jiraate, qajeelfama lakkoofsa eegumsaa haaressuuf deebisu ergineerra.',
      });
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        res.status(400).json({
          error: error.errors[0]?.message || 'dogoggora',
        });
        return;
      }

      logger.error({ err: error, route: req.path }, 'Forgot password error');
      res.status(500).json({
        error: 'Dogoggora keessoo meeshaa. Maaloo xiqqoo turee yaali.',
      });
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      const result = await AuthService.resetPassword(validatedData);
      res.status(200).json(result);
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        res.status(400).json({ error: error.errors[0]?.message || 'Galmeen sirrii miti' });
        return;
      }
      logger.error({ err: error, route: req.path }, 'Reset password error');
      res
        .status(error.message === 'RESET_TOKEN_INVALID' ? 400 : 500)
        .json({
          error:
            error.message === 'RESET_TOKEN_INVALID'
              ? 'Mallattoon haaromsaa sirrii miti ykn yeroon isaa darbe.'
              : 'Dogoggora serverii',
        });
    }
  }

  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Hin seenin' });
        return;
      }
      const validatedData = changePasswordSchema.parse(req.body);
      const result = await AuthService.changePassword(userId, validatedData);
      res.status(200).json(result);
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        res.status(400).json({ error: error.errors[0]?.message || 'Dogoggora galmee' });
        return;
      }
      logger.error({ err: error, route: req.path }, 'Change password error');
      res.status(400).json({ error: error.message || 'Dogoggora serverii' });
    }
  }
}
