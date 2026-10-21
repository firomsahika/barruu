import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import articleRoutes from './routes/articles';
import tagRoutes from './routes/tags';
import userRoutes from './routes/users';
import commentRoutes from './routes/comments';
import notificationRoutes from './routes/notifications';
import uploadRoutes from './routes/uploads';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const clientOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production');
}

const server = http.createServer(app);

import { setSocketIO } from './lib/socket';

export const io = new Server(server, {
  cors: {
    origin: clientOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setSocketIO(io);

io.on('connection', (socket) => {
  // Client should emit 'join' with their user ID when they connect
  socket.on('join', (userId) => {
    socket.join(userId);
  });
});

// Middleware
app.disable('x-powered-by');
app.use(cors({
  origin: clientOrigins,
  credentials: true,
}));
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Siidaa Barruu API is running' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Barruu server running on port ${PORT}`);
});

export default app;
