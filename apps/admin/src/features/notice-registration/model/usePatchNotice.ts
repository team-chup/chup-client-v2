'use client';

import { type ApiResponseType, patch } from '@chup/core/shared';
import { toast } from '@chup/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  type AdminNoticeDetailType,
  adminNoticeQueryKeys,
  adminNoticeUrl,
} from '@/entities/notice';

import type { NoticeRegistrationReqType } from './schema';

interface PatchNoticeParamsType {
  noticeId: number;
  body: NoticeRegistrationReqType;
}

export const usePatchNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noticeId, body }: PatchNoticeParamsType) => {
      const response = await patch<ApiResponseType<AdminNoticeDetailType>>(
        adminNoticeUrl.patchNotice(noticeId),
        body,
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminNoticeQueryKeys.all() });
      toast.success('공지사항이 수정되었습니다.');
    },
  });
};
