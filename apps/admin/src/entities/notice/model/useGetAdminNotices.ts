'use client';

import { type ApiResponseType, get } from '@chup/core/shared';
import { useQuery } from '@tanstack/react-query';

import { adminNoticeUrl } from '../api/endpoints';
import { adminNoticeQueryKeys } from './queryKeys';
import type { AdminNoticeType, GetAdminNoticesParamsType } from './types';

export const useGetAdminNotices = (params: GetAdminNoticesParamsType = {}) =>
  useQuery({
    queryKey: adminNoticeQueryKeys.getNotices(params),
    queryFn: async () => {
      const response = await get<ApiResponseType<AdminNoticeType[]>>(
        adminNoticeUrl.getNotices(params.q),
      );

      return response.data;
    },
  });
