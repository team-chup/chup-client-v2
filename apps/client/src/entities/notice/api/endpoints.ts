import type { GetNoticesParamsType } from '../model/types';

export const noticeUrl = {
  getNotices: (params: GetNoticesParamsType = {}) =>
    params.q ? `/api/notices?q=${encodeURIComponent(params.q)}` : '/api/notices',
  getNotice: (noticeId: number) => `/api/notices/${noticeId}`,
} as const;
