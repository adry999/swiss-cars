import { z } from 'zod';

export const AdminCredentialsSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AdminCredentials = z.infer<typeof AdminCredentialsSchema>;
