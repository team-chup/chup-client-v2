'use client';

import { type ApiResponseType, get } from '@chup/core/shared';
import { useQuery } from '@tanstack/react-query';

import { noticeUrl } from '../api/endpoints';
import { noticeQueryKeys } from './queryKeys';
import type { GetNoticesParamsType, NoticeSummaryType } from './types';

export const useGetNotices = (params: GetNoticesParamsType = {}) =>
  useQuery({
    queryKey: noticeQueryKeys.getNotices(params),
    queryFn: async () => {
      const response = await get<ApiResponseType<NoticeSummaryType[]>>(
        noticeUrl.getNotices(params),
      );

      return response.data;
    },
  });
