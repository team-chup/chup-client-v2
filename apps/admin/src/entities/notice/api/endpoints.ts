export const adminNoticeUrl = {
  getNotices: () => '/api/notices',
  getNotice: (noticeId: number) => `/api/notices/${noticeId}`,
  postNotice: () => '/api/admin/notices',
  patchNotice: (noticeId: number) => `/api/admin/notices/${noticeId}`,
  deleteNotice: (noticeId: number) => `/api/admin/notices/${noticeId}`,
} as const;
