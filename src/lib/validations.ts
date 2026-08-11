import { z } from 'zod';
import { isAvatarId } from '@/config/avatars';

export const campaignStatusSchema = z.enum(['open', 'ongoing', 'completed']);

const checkboxBool = z.preprocess(
  (value) =>
    value === true || value === 'on' || value === 'true' || value === '1',
  z.boolean(),
);

export const campaignFormSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(5000),
  rules: z
    .string()
    .trim()
    .max(10000)
    .optional()
    .transform((value) => value ?? ''),
  max_players: z.coerce.number().int().positive().default(4),
  max_level: z.coerce.number().int().positive().default(4),
  status: campaignStatusSchema.default('open'),
  allow_duplicate_races: checkboxBool,
  allow_duplicate_classes: checkboxBool,
});

export const inviteTtlSchema = z.object({
  ttl_days: z.coerce.number().int().min(1).max(365).default(14),
});

const avatarIdSchema = z
  .string()
  .refine((value) => isAvatarId(value), 'Invalid avatar');

const uuidSchema = z.string().uuid();

export const characterFormSchema = z.object({
  character_name: z.string().trim().min(1).max(80),
  image: avatarIdSchema,
  race_id: uuidSchema,
  class_id: uuidSchema,
  email: z.email().max(254),
  contribution: z.string().trim().min(1).max(2000),
  biography: z.string().trim().min(1).max(4000),
});

export const catalogItemFormSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  is_active: checkboxBool,
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});

export const profileFormSchema = z.object({
  display_name: z.string().trim().min(1).max(80),
  fictional_name: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((value) => value ?? ''),
  bio: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => value ?? ''),
  image: avatarIdSchema,
});

export const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(6).max(128),
});
