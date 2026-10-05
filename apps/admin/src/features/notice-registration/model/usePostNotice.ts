'use client';

import { type ApiResponseType, post } from '@chup/core/shared';
import { toast } from '@chup/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  type AdminNoticeDetailType,
  adminNoticeQueryKeys,
  adminNoticeUrl,
} from '@/entities/notice';

import type { NoticeRegistrationReqType } from './schema';

export const usePostNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: NoticeRegistrationReqType) => {
      const response = await post<ApiResponseType<AdminNoticeDetailType>>(
        adminNoticeUrl.postNotice(),
        body,
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminNoticeQueryKeys.all() });
      toast.success('공지사항이 등록되었습니다.');
    },
  });
};
