import { z } from 'zod';

export const countrySchema = z.object({
  name: z.object({
    common: z.string(),
    official: z.string(),
    nativeName: z.record(
      z.object({
        official: z.string(),
        common: z.string()
      })
    ).optional()
  }),
  languages: z.record(z.string()).optional()
});
