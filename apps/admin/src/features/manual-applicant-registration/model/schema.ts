import { z } from 'zod';

export const ManualApplicantRegistrationSchema = z.object({
  userId: z
    .string()
    .trim()
    .min(1, '학생 ID를 입력해주세요.')
    .regex(/^\d+$/, '올바른 학생 ID를 입력해주세요.'),
  companyName: z.string().trim().min(1, '회사명을 입력해주세요.'),
  sourcePlatform: z.string().trim().min(1, '지원 경로를 입력해주세요.'),
  status: z.enum(['APPLIED', 'INTERVIEW_SCHEDULED', 'PASSED', 'FAILED'], {
    error: '현재 상태를 선택해주세요.',
  }),
});

export type ManualApplicantRegistrationReqType = z.infer<typeof ManualApplicantRegistrationSchema>;
