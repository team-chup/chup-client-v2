'use client';

import { type ApiResponseType, get } from '@chup/core/shared';
import { useQuery } from '@tanstack/react-query';

import { adminNoticeUrl } from '../api/endpoints';
import { adminNoticeQueryKeys } from './queryKeys';
import type { AdminNoticeType } from './types';

export const useGetAdminNotices = () =>
  useQuery({
    queryKey: adminNoticeQueryKeys.getNotices(),
    queryFn: async () => {
      const response = await get<ApiResponseType<AdminNoticeType[]>>(adminNoticeUrl.getNotices());

      return response.data;
    },
  });
