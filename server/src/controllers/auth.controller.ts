import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validations/auth.validation';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await AuthService.register(validatedData);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: error.errors[0].message });
        return;
      }
      console.error('Register error:', error);
      res.status(400).json({ error: error.message || 'Dogoggora serverii' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedData);
      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: error.errors[0].message });
        return;
      }
      console.error('Login error:', error);
      res.status(401).json({ error: error.message || 'Dogoggora serverii' });
    }
  }

  static async me(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Hin seenin' });
        return;
      }
      const user = await AuthService.getCurrentUser(userId);
      res.json(user);
    } catch (error: any) {
      console.error('Me error:', error);
      res.status(404).json({ error: error.message || 'Fayyadamaan hin argamne' });
    }
  }
}
