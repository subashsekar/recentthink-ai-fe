import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirm_new_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: 'Passwords do not match',
    path: ['confirm_new_password'],
  });

const optionalHttpsUrl = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const url = new URL(val);
        return url.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'Must be a valid https URL' },
  );

const linkedinUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const url = new URL(val);
        if (url.protocol !== 'https:') return false;
        const host = url.hostname.toLowerCase().replace(/^www\./, '');
        return host === 'linkedin.com' || host.endsWith('.linkedin.com');
      } catch {
        return false;
      }
    },
    { message: 'Must be a valid https LinkedIn URL (linkedin.com)' },
  );

const platformUsernameSchema = z
  .string()
  .trim()
  .refine((val) => !val || /^@?[a-zA-Z0-9_-]+$/.test(val), {
    message: 'Only letters, numbers, underscores, and hyphens',
  });

export const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  first_name: z.string().trim().max(100),
  last_name: z.string().trim().max(100),
  bio: z.string().trim().max(500, 'Bio must be at most 500 characters'),
  mobile_number: z
    .string()
    .trim()
    .refine((val) => !val || /^\+?[0-9]{8,15}$/.test(val), {
      message: 'Enter a valid phone number (8–15 digits, optional +)',
    }),
  current_status: z.string(),
  college: z.string().trim().max(200),
  company: z.string().trim().max(200),
  current_role: z.string().trim().max(200),
  experience_years: z.string().refine(
    (val) => {
      if (!val.trim()) return true;
      const n = Number(val);
      return Number.isInteger(n) && n >= 0 && n <= 60;
    },
    { message: 'Experience must be between 0 and 60' },
  ),
  primary_skill: z.string(),
  leetcode_username: platformUsernameSchema,
  hackerrank_username: platformUsernameSchema,
  github_username: platformUsernameSchema,
  linkedin_url: linkedinUrlSchema,
  portfolio_url: optionalHttpsUrl,
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;

export const disableAccountSchema = z
  .object({
    password: z.string().min(1, 'Password is required'),
    confirm_text: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.confirm_text.trim() !== 'DISABLE') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Type DISABLE to confirm',
        path: ['confirm_text'],
      });
    }
  });

export const deleteAccountSchema = z
  .object({
    password: z.string().min(1, 'Password is required'),
    confirm: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.confirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'You must confirm account deletion',
        path: ['confirm'],
      });
    }
  });

export const enableAccountSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type DisableAccountFormData = z.infer<typeof disableAccountSchema>;
export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;
export type EnableAccountFormData = z.infer<typeof enableAccountSchema>;
