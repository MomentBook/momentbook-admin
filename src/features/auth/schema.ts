import { z } from "zod";

/** The sign-in fields, checked in the form as they are left and again in
 * the action. Both are trimmed, as the action always has; the browser checks
 * the email's shape (`type="email"`). */
export const loginFields = z.object({
  email: z.string().trim().min(1, "Enter email."),
  password: z.string().trim().min(1, "Enter password."),
});

export type LoginFields = z.infer<typeof loginFields>;
