import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema, forgotPasswordSchema } from '../validations/auth.validation';

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

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body using Zod schema
      const validatedData = forgotPasswordSchema.parse(req.body);

      // Process reset logic in service layer
      await AuthService.forgotPassword(validatedData);

      // ALWAYS return success to prevent email enumeration/harvesting attacks
      res.status(200).json({
        message: 'Ergaaniiyyuu yoo jiraate, qajeelfama lakkoofsa eegumsaa haaressuuf deebisu ergineerra.',
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          error: error.errors[0]?.message || 'dogoggora'
        });
        return;
      }

      console.error('Forgot password error:', error);

      // Do not leak internal system/SMTP/Database errors to the client
      res.status(500).json({
        error: 'Dogoggora keessoo meeshaa. Maaloo xiqqoo turee yaali.'
      });
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

    } catch (error: any) {
      console.error('Reset password error:', error);
      res.status(400).json({ error: error.message || 'Dogoggora serverii' });
    }
  }

  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { oldPassword, newPassword } = req.body;

    } catch (error: any) {
      console.error('Change password error:', error);
      res.status(400).json({ error: error.message || 'Dogoggora serverii' });
    }
  }

  static async getOtherProfile(req: Request, res: Response): Promise<void> {
    try {
      // Extract the specific ID parameter from req.params (e.g., /users/:id or /users/:userId)
      const rawId = req.params.id;

      const id = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!id) {
        res.status(400).json({ error: 'Id\'n fayyadamaa ni barbaachisa' });
        return;
      }

      const user = await AuthService.getOtherProfile(id);

      res.status(200).json(user);
    } catch (error: any) {
      console.error('Get other profile error:', error);

      if (error.message === 'USER_NOT_FOUND') {
        res.status(404).json({ error: 'Fayyadamaan hin argamne' });
        return;
      }

      res.status(500).json({ error: 'Dogoggora keessoo meeshaa' });
    }
  }


}
