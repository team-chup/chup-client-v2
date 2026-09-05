'use client';

import Link from 'next/link';

import { Button, Separator } from '@chup/ui';
import { ArrowLeft, CalendarDays, CircleAlert, Loader2 } from 'lucide-react';

import { useGetNotice } from '@/entities/notice';

interface NoticeDetailViewProps {
  noticeId: number;
}

const NoticeDetailView = ({ noticeId }: NoticeDetailViewProps) => {
  const { data: notice, isError, isPending } = useGetNotice(noticeId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        nativeButton={false}
        render={<Link href="/notices" />}
      >
        <ArrowLeft />
        목록으로
      </Button>
      {isPending && (
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-20 text-sm">
          <Loader2 className="size-5 animate-spin" />
          공지사항을 불러오는 중이에요.
        </div>
      )}
      {isError && (
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-20 text-sm">
          <CircleAlert className="size-5" />
          공지사항을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </div>
      )}
      {notice && (
        <div className="bg-card rounded-2xl border p-6">
          <p className="text-primary text-sm font-semibold">공지사항</p>
          <h1 className="mt-1 text-2xl font-bold text-balance">{notice.title}</h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-1 text-sm">
            <CalendarDays className="size-4" />
            {notice.createdAt}
          </p>
          <Separator className="my-6" />
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{notice.content}</p>
        </div>
      )}
    </div>
  );
};

export default NoticeDetailView;
