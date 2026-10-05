'use client';

import { type ApiResponseType, get } from '@chup/core/shared';
import { useQuery } from '@tanstack/react-query';

import { noticeUrl } from '../api/endpoints';
import { noticeQueryKeys } from './queryKeys';
import type { NoticeSummaryType } from './types';

export const useGetNotices = () =>
  useQuery({
    queryKey: noticeQueryKeys.getNotices(),
    queryFn: async () => {
      const response = await get<ApiResponseType<NoticeSummaryType[]>>(noticeUrl.getNotices());

      return response.data;
    },
  });
