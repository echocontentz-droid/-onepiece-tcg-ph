import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirm_password: z.string(),
    display_name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(60, "Name must be under 60 characters"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be under 30 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    province: z.string().optional(),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^(\+63|0)9\d{9}$/.test(val.replace(/\s/g, "")),
        "Invalid Philippine mobile number (e.g. 09XXXXXXXXX)"
      ),
    agree_terms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const updateProfileSchema = z.object({
  display_name: z.string().min(2).max(60),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  bio: z.string().max(500).optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+63|0)9\d{9}$/.test(val.replace(/\s/g, "")),
      "Invalid Philippine mobile number"
    ),
  gcash_number: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+63|0)9\d{9}$/.test(val.replace(/\s/g, "")),
      "Invalid GCash number"
    ),
  maya_number: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+63|0)9\d{9}$/.test(val.replace(/\s/g, "")),
      "Invalid Maya number"
    ),
  allow_meetup: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
