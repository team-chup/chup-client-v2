'use client';

import { useState } from 'react';

import { Input } from '@chup/ui';
import { CircleAlert, Inbox, Loader2, Search } from 'lucide-react';

import { NoticeCard, useGetNotices } from '@/entities/notice';

const NoticesView = () => {
  const [query, setQuery] = useState<string>('');
  const { data: notices, isError, isPending } = useGetNotices({ q: query });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-primary text-sm font-semibold">공지사항</p>
        <h1 className="mt-1 text-3xl font-bold">취업 관련 소식을 확인하세요</h1>
        <p className="text-muted-foreground mt-2">학교에서 전달하는 공지사항을 모아봤어요.</p>
      </div>
      <div className="bg-card rounded-2xl border p-4">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
            placeholder="제목 검색"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isPending && (
          <div className="text-muted-foreground col-span-full flex flex-col items-center gap-2 py-10 text-sm">
            <Loader2 className="size-5 animate-spin" />
            공지사항을 불러오는 중이에요.
          </div>
        )}
        {isError && (
          <div className="text-muted-foreground col-span-full flex flex-col items-center gap-2 py-10 text-sm">
            <CircleAlert className="size-5" />
            공지사항을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </div>
        )}
        {!isPending && !isError && notices?.length === 0 && (
          <div className="text-muted-foreground col-span-full flex flex-col items-center gap-2 py-10 text-sm">
            <Inbox className="size-5" />
            등록된 공지사항이 없어요.
          </div>
        )}
        {notices?.map((notice) => (
          <NoticeCard key={notice.id} notice={notice} />
        ))}
      </div>
    </div>
  );
};

export default NoticesView;
