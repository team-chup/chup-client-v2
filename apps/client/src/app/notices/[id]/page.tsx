import { notFound } from 'next/navigation';

import { NoticeDetailView } from '@/views/notice-detail';

interface NoticeDetailPageProps {
  params: Promise<{ id: string }>;
}

const NoticeDetailPage = async ({ params }: NoticeDetailPageProps) => {
  const { id } = await params;
  const noticeId = Number(id);

  if (!Number.isInteger(noticeId) || noticeId <= 0) notFound();

  return <NoticeDetailView noticeId={noticeId} />;
};

export default NoticeDetailPage;
