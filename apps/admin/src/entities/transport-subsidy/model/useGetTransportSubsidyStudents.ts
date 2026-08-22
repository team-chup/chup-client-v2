'use client';

import { type ApiResponseType, get } from '@chup/core/shared';
import { useQuery } from '@tanstack/react-query';

import { transportSubsidyUrl } from '../api/endpoints';
import { transportSubsidyQueryKeys } from './queryKeys';
import type { TransportSubsidyStudentType } from './types';

export const useGetTransportSubsidyStudents = () =>
  useQuery({
    queryKey: transportSubsidyQueryKeys.getTransportSubsidyStudents(),
    queryFn: async () => {
      const response = await get<ApiResponseType<TransportSubsidyStudentType[]>>(
        transportSubsidyUrl.getStudents(),
      );

      return response.data;
    },
  });
