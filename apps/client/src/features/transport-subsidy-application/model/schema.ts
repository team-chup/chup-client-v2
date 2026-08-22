import { z } from 'zod';

import { validateEvidenceFiles } from './validateEvidenceFiles';

export const TransportSubsidyApplicationSchema = z
  .object({
    companyName: z.string().trim().min(1),
    interviewAt: z.string().trim().min(1),
    files: z.array(z.instanceof(File)),
  })
  .superRefine(({ files }, ctx) => {
    const message = validateEvidenceFiles(files);
    if (message) ctx.addIssue({ code: 'custom', path: ['files'], message });
  });

export type TransportSubsidyApplicationReqType = z.infer<typeof TransportSubsidyApplicationSchema>;
