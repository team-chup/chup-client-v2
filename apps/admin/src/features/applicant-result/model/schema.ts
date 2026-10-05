import { z } from 'zod';

export const ApplicationResultSchema = z
  .object({
    status: z.enum(['APPLIED', 'DOCUMENT_FAILED', 'INTERVIEW_SCHEDULED', 'PASSED', 'FAILED']),
    applicationSource: z.enum(['OFFICIAL', 'EXTERNAL']),
    interviewAt: z.string().trim().optional(),
  })
  .superRefine(({ status, applicationSource, interviewAt }, context) => {
    if (status === 'DOCUMENT_FAILED' && applicationSource !== 'OFFICIAL') {
      context.addIssue({
        code: 'custom',
        message: '서류 탈락은 공식 채용 공고 지원자만 처리할 수 있어요.',
        path: ['status'],
      });
    }

    if (status === 'INTERVIEW_SCHEDULED' && !interviewAt) {
      context.addIssue({
        code: 'custom',
        message: '면접 일시를 입력해주세요.',
        path: ['interviewAt'],
      });
    }
  });
