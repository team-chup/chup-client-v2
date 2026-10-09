import { z } from 'zod';

export const NOTICE_TITLE_MAX_LENGTH = 100;
export const NOTICE_CONTENT_MAX_LENGTH = 10000;

export const NoticeRegistrationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '제목을 입력해주세요.')
    .max(NOTICE_TITLE_MAX_LENGTH, `제목은 ${NOTICE_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`),
  content: z
    .string()
    .trim()
    .min(1, '내용을 입력해주세요.')
    .max(
      NOTICE_CONTENT_MAX_LENGTH,
      `내용은 ${NOTICE_CONTENT_MAX_LENGTH.toLocaleString()}자 이하로 입력해주세요.`,
    ),
});

export type NoticeRegistrationReqType = z.infer<typeof NoticeRegistrationSchema>;
