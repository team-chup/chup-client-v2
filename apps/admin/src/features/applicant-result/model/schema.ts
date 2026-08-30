import { z } from 'zod';

export const ApplicationResultSchema = z
  .object({
    status: z.enum(['APPLIED', 'INTERVIEW_SCHEDULED', 'PASSED', 'FAILED']),
    interviewAt: z.string().trim().optional(),
  })
  .superRefine(({ status, interviewAt }, context) => {
    if (status === 'INTERVIEW_SCHEDULED' && !interviewAt) {
      context.addIssue({
        code: 'custom',
        message: '면접 일시를 입력해주세요.',
        path: ['interviewAt'],
      });
    }
  });
