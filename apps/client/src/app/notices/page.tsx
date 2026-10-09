import { redirect } from 'next/navigation';

import { NoticesView } from '@/views/notices';

interface NoticesPageProps {
  searchParams: Promise<{ noticeId?: string | string[] }>;
}

// Discord 공지 알림은 `/notices?noticeId={id}`로 연결되므로 상세 페이지로 보낸다
const NoticesPage = async ({ searchParams }: NoticesPageProps) => {
  const { noticeId } = await searchParams;
  const id = Number(noticeId);

  if (Number.isInteger(id) && id > 0) redirect(`/notices/${id}`);

  return <NoticesView />;
};

export default NoticesPage;
