export const noticeQueryKeys = {
  all: () => ['notices'] as const,
  getNotices: () => ['notices', 'list'] as const,
  getNotice: (noticeId: number) => ['notices', 'detail', noticeId] as const,
} as const;
