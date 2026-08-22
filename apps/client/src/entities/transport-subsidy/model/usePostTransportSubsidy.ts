'use client';

import { type ApiResponseType, post } from '@chup/core/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { transportSubsidyUrl } from '../api/endpoints';
import { transportSubsidyQueryKeys } from './queryKeys';
import type { PostTransportSubsidyReqType, TransportSubsidyType } from './types';

export const usePostTransportSubsidy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyName, interviewAt, files }: PostTransportSubsidyReqType) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const response = await post<ApiResponseType<TransportSubsidyType>>(
        transportSubsidyUrl.postTransportSubsidy(companyName, interviewAt),
        formData,
      );

      return response.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: transportSubsidyQueryKeys.getTransportSubsidies(),
      }),
  });
};
