export interface GetNoticesParamsType {
  q?: string;
}

export interface NoticeSummaryType {
  id: number;
  title: string;
  createdAt: string;
}

export interface NoticeDetailType extends NoticeSummaryType {
  content: string;
}
