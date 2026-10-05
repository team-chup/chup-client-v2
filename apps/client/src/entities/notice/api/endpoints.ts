export const noticeUrl = {
  getNotices: () => '/api/notices',
  getNotice: (noticeId: number) => `/api/notices/${noticeId}`,
} as const;
