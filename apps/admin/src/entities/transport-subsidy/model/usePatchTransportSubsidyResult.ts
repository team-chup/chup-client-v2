'use client';

import { type ApiResponseType, patch } from '@chup/core/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { transportSubsidyUrl } from '../api/endpoints';
import { transportSubsidyQueryKeys } from './queryKeys';
import type { AdminTransportSubsidyType, PatchTransportSubsidyResultReqType } from './types';

export const usePatchTransportSubsidyResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, status }: PatchTransportSubsidyResultReqType) => {
      const response = await patch<ApiResponseType<AdminTransportSubsidyType>>(
        transportSubsidyUrl.patchResult(applicationId),
        { status },
      );

      return response.data;
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: transportSubsidyQueryKeys.getTransportSubsidyStudents(),
        }),
        queryClient.invalidateQueries({
          queryKey: transportSubsidyQueryKeys.getTransportSubsidies(),
        }),
      ]),
  });
};
