import { z } from 'zod';

export const ExternalApplicationRegistrationSchema = z.object({
  companyName: z.string().trim().min(1, '회사명을 입력해주세요.'),
  sourcePlatform: z.string().trim().min(1, '지원 경로를 입력해주세요.'),
  interviewAt: z.string().trim().min(1, '면접 일시를 입력해주세요.'),
});

export type ExternalApplicationRegistrationReqType = z.infer<
  typeof ExternalApplicationRegistrationSchema
>;
