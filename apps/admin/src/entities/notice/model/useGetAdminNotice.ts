'use client';

import { type ApiResponseType, get } from '@chup/core/shared';
import { useQuery } from '@tanstack/react-query';

import { adminNoticeUrl } from '../api/endpoints';
import { adminNoticeQueryKeys } from './queryKeys';
import type { AdminNoticeDetailType } from './types';

export const useGetAdminNotice = (noticeId: number) =>
  useQuery({
    queryKey: adminNoticeQueryKeys.getNotice(noticeId),
    queryFn: async () => {
      const response = await get<ApiResponseType<AdminNoticeDetailType>>(
        adminNoticeUrl.getNotice(noticeId),
      );

      return response.data;
    },
    enabled: noticeId > 0,
  });
