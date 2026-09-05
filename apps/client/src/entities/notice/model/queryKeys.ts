import type { GetNoticesParamsType } from './types';

export const noticeQueryKeys = {
  all: () => ['notices'] as const,
  getNotices: (params: GetNoticesParamsType = {}) => ['notices', 'list', params] as const,
  getNotice: (noticeId: number) => ['notices', 'detail', noticeId] as const,
} as const;
