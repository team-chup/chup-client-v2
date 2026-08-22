'use client';

import { type ApiResponseType, get } from '@chup/core/shared';
import { useQuery } from '@tanstack/react-query';

import { transportSubsidyUrl } from '../api/endpoints';
import { transportSubsidyQueryKeys } from './queryKeys';
import type { AdminTransportSubsidyType } from './types';

export const useGetTransportSubsidies = (userId?: number) =>
  useQuery({
    queryKey: transportSubsidyQueryKeys.getTransportSubsidies(userId),
    enabled: userId !== undefined,
    queryFn: async () => {
      const response = await get<ApiResponseType<AdminTransportSubsidyType[]>>(
        transportSubsidyUrl.getTransportSubsidies(userId),
      );

      return response.data;
    },
  });
