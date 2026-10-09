export interface AdminNoticeType {
  id: number;
  title: string;
  createdAt: string;
}

export interface AdminNoticeDetailType extends AdminNoticeType {
  content: string;
}
