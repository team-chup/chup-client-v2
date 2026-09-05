export interface GetAdminNoticesParamsType {
  q?: string;
}

export interface AdminNoticeType {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}
