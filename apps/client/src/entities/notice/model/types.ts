export interface NoticeSummaryType {
  id: number;
  title: string;
  createdAt: string;
}

export interface NoticeDetailType extends NoticeSummaryType {
  content: string;
}
