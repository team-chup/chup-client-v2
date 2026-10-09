'use client';

import { type ApiResponseType, get } from '@chup/core/shared';
import { useQuery } from '@tanstack/react-query';

import { noticeUrl } from '../api/endpoints';
import { noticeQueryKeys } from './queryKeys';
import type { NoticeDetailType } from './types';

export const useGetNotice = (noticeId: number) =>
  useQuery({
    queryKey: noticeQueryKeys.getNotice(noticeId),
    queryFn: async () => {
      const response = await get<ApiResponseType<NoticeDetailType>>(noticeUrl.getNotice(noticeId));

      return response.data;
    },
    enabled: noticeId > 0,
  });
