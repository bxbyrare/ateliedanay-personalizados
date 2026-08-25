import { z } from "zod";

// `credential` is the raw ID token JWT returned by Google Identity Services on the
// frontend — the backend independently verifies its signature and audience, never
// trusting anything from the client beyond this opaque string.
export const googleAuthSchema = z.object({
  credential: z.string().min(20).max(4096),
});
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
