export const adminNoticeUrl = {
  getNotices: (q?: string) =>
    q ? `/api/admin/notices?q=${encodeURIComponent(q)}` : '/api/admin/notices',
  postNotice: () => '/api/admin/notices',
  patchNotice: (noticeId: number) => `/api/admin/notices/${noticeId}`,
  deleteNotice: (noticeId: number) => `/api/admin/notices/${noticeId}`,
} as const;
