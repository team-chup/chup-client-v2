'use client';

import { type ApiResponseType, get } from '@chup/core/shared';
import { useQuery } from '@tanstack/react-query';

import { transportSubsidyUrl } from '../api/endpoints';
import { transportSubsidyQueryKeys } from './queryKeys';
import type { TransportSubsidyType } from './types';

export const useGetTransportSubsidies = () =>
  useQuery({
    queryKey: transportSubsidyQueryKeys.getTransportSubsidies(),
    queryFn: async () => {
      const response = await get<ApiResponseType<TransportSubsidyType[]>>(
        transportSubsidyUrl.getTransportSubsidies(),
      );

      return response.data;
    },
  });
