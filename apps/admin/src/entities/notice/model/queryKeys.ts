import type { GetAdminNoticesParamsType } from './types';

export const adminNoticeQueryKeys = {
  all: () => ['admin-notices'] as const,
  getNotices: (params: GetAdminNoticesParamsType = {}) =>
    ['admin-notices', 'list', params] as const,
} as const;
