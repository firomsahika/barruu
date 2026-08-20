import { z } from 'zod';

export const createArticleSchema = z.object({
  title: z.string().min(3, 'Mata-duree galchaa'),
  content: z.string().min(10, 'Qabiyyee galchaa'),
  excerpt: z.string().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  audioUrl: z.string().url().optional().or(z.literal('')),
  category: z.enum(['WALALOO', 'DURDURII', 'ASOOSAMA', 'OOLMAA', 'SAGALEE']).optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

export const updateArticleSchema = createArticleSchema.partial().extend({
  featured: z.boolean().optional(),
});
