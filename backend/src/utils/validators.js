const { z } = require('zod');

const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'go',
  'rust',
  'java',
  'cpp',
  'csharp',
  'ruby',
  'php',
  'c',
  'sql',
];

const REVIEW_SOURCES = ['textarea', 'uploaded', 'marked'];

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(128),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10).optional(),
});

const createReviewSchema = z.object({
  title: z.string().trim().max(140).optional(),
  language: z.enum(SUPPORTED_LANGUAGES),
  code: z.string().min(1).max(100_000),
  context: z.string().trim().max(2000).optional(),
  source: z.enum(REVIEW_SOURCES).optional().default('textarea'),
  fileName: z.string().max(255).optional(),
  isMarked: z.boolean().optional().default(false),
});

const listReviewsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  language: z.enum(SUPPORTED_LANGUAGES).optional(),
  status: z.enum(['pending', 'completed', 'failed']).optional(),
  source: z.enum(REVIEW_SOURCES).optional(),
  isMarked: z.coerce.boolean().optional(),
});

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

module.exports = {
  SUPPORTED_LANGUAGES,
  REVIEW_SOURCES,
  registerSchema,
  loginSchema,
  refreshSchema,
  createReviewSchema,
  listReviewsSchema,
  objectIdSchema,
};
