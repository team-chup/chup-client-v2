'use client';

import { useState } from 'react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@chup/ui';
import { MoreHorizontal } from 'lucide-react';

import type { AdminNoticeType } from '@/entities/notice';

import { useDeleteNotice } from '../model/useDeleteNotice';

interface NoticeActionsButtonProps {
  notice: AdminNoticeType;
  onEdit: (notice: AdminNoticeType) => void;
}

const NoticeActionsButton = ({ notice, onEdit }: NoticeActionsButtonProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const { mutate: deleteNotice, isPending } = useDeleteNotice();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" aria-label="공지사항 관리 메뉴" />}
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(notice)}>공지사항 수정</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            공지사항 삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-xl">
          <DialogTitle>공지사항을 삭제할까요?</DialogTitle>
          <p className="text-muted-foreground mt-2 text-sm">삭제한 공지사항은 복구할 수 없어요.</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() =>
                deleteNotice(notice.id, { onSuccess: () => setIsDeleteDialogOpen(false) })
              }
            >
              삭제
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NoticeActionsButton;
