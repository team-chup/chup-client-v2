'use client';

import { useState } from 'react';

import { Button, Card, CardContent, Input } from '@chup/ui';
import { CircleAlert, Inbox, Loader2, Plus, Search } from 'lucide-react';

import { type AdminNoticeType, useGetAdminNotices } from '@/entities/notice';
import { NoticeActionsButton } from '@/features/notice-delete';
import { NoticeRegistrationForm } from '@/features/notice-registration';

const NoticesView = () => {
  const [query, setQuery] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingNotice, setEditingNotice] = useState<AdminNoticeType | null>(null);
  const { data: notices, isError, isPending } = useGetAdminNotices({ q: query });

  const handleCreate = () => {
    setEditingNotice(null);
    setIsFormOpen(true);
  };

  const handleEdit = (notice: AdminNoticeType) => {
    setEditingNotice(notice);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingNotice(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-primary text-sm font-semibold">공지사항 관리</p>
          <h1 className="mt-1 text-3xl font-bold">취업 관련 공지사항을 관리하세요</h1>
          <p className="text-muted-foreground mt-2">
            등록한 공지사항은 학생 앱에 바로 노출되고 Discord로 알림이 전송돼요.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus />새 공지사항 등록
        </Button>
      </div>
      {isFormOpen && (
        <NoticeRegistrationForm
          key={editingNotice?.id ?? 'new'}
          notice={editingNotice ?? undefined}
          onClose={handleFormClose}
        />
      )}
      <Card className="p-0">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 border-b p-4">
            <Search className="text-muted-foreground size-4" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="border-0 shadow-none focus-visible:ring-0"
              placeholder="제목으로 검색"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-secondary/60 text-muted-foreground text-left">
                <tr>
                  <th className="px-5 py-3 font-medium">제목</th>
                  <th className="px-5 py-3 font-medium">등록일</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">관리</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {isPending && (
                  <tr>
                    <td colSpan={3} className="text-muted-foreground px-5 py-10 text-center">
                      <Loader2 className="mr-2 inline size-4 animate-spin" />
                      공지사항을 불러오는 중이에요.
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td colSpan={3} className="text-muted-foreground px-5 py-10 text-center">
                      <CircleAlert className="mr-2 inline size-4" />
                      공지사항을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
                    </td>
                  </tr>
                )}
                {!isPending && !isError && notices?.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-muted-foreground px-5 py-10 text-center">
                      <Inbox className="mr-2 inline size-4" />
                      등록된 공지사항이 없어요.
                    </td>
                  </tr>
                )}
                {notices?.map((notice) => (
                  <tr key={notice.id} className="border-t">
                    <td className="px-5 py-4">
                      <p className="font-semibold">{notice.title}</p>
                      <p className="text-muted-foreground truncate">{notice.content}</p>
                    </td>
                    <td className="px-5 py-4">{notice.createdAt}</td>
                    <td className="px-5 py-4 text-right">
                      <NoticeActionsButton notice={notice} onEdit={handleEdit} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoticesView;
