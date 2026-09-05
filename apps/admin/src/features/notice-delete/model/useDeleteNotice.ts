'use client';

import { del } from '@chup/core/shared';
import { toast } from '@chup/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminNoticeQueryKeys, adminNoticeUrl } from '@/entities/notice';

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noticeId: number) => {
      await del<void>(adminNoticeUrl.deleteNotice(noticeId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminNoticeQueryKeys.all() });
      toast.success('공지사항이 삭제되었습니다.');
    },
    onError: () => toast.error('공지사항 삭제에 실패했습니다.'),
  });
};
