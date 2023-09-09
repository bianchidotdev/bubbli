import { z } from 'zod';

export const userSchema = z.object({
  displayName: z
    .string({ required_error: 'Display Name is required' })
    .min(1, { message: 'Display Name is required' })
    .trim(),
  username: z
    .string({ required_error: 'Username is required' })
    .min(1, { message: 'Username is required' })
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' })
    .trim(),
  confirmPassword: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' })
    .trim()
  //terms: z.boolean({ required_error: 'You must accept the terms and privacy policy' }),
});
