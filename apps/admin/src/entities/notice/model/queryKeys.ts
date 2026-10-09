export const adminNoticeQueryKeys = {
  all: () => ['admin-notices'] as const,
  getNotices: () => ['admin-notices', 'list'] as const,
  getNotice: (noticeId: number) => ['admin-notices', 'detail', noticeId] as const,
} as const;
