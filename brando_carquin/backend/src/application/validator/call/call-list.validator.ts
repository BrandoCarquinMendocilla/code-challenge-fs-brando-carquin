import { z } from "zod";

export const CallListSchema = z.object({
  status: z.string().optional(),
});
