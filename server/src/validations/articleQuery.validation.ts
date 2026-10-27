import { z } from 'zod';

export const articleQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, 'Lakkoofsi fuulaa lakkoofsa taʼuu qaba')
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, 'Daangaan lakkoofsa taʼuu qaba')
    .optional(),
  category: z
    .enum(['ODUU', 'MAMMAAKSA', 'SEENAA', 'WALALOO', 'DURDURII', 'ASOOSAMA', 'OOLMAA', 'SAGALEE'])
    .optional(),
  tag: z.string().optional(),
  sort: z.enum(['latest', 'top', 'oldest', 'trending']).optional(),
  search: z.string().optional(),
  author: z.string().optional(),
  featured: z.enum(['true', 'false']).optional(),
});

export type ArticleQueryInput = z.infer<typeof articleQuerySchema>;
