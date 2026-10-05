const noticeDateFormatter = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' });

export const formatNoticeDate = (createdAt: string) =>
  noticeDateFormatter.format(new Date(createdAt));
