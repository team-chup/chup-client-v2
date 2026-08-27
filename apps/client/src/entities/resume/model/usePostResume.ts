'use client';

import { type ApiResponseType, post } from '@chup/core/shared';
import { toast } from '@chup/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { GA_EVENT, trackEvent } from '@/shared/lib/analytics';

import { resumeUrl } from '../api/endpoints';
import { resumeQueryKeys } from './queryKeys';
import type { ResumeType } from './types';

interface PostResumeParamsType {
  file: File;
  onUploadProgress?: (percent: number) => void;
}

export const usePostResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, onUploadProgress }: PostResumeParamsType) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await post<ApiResponseType<ResumeType>>(resumeUrl.postResume(), formData, {
        onUploadProgress: (event) => {
          if (!onUploadProgress || !event.total) return;
          onUploadProgress(Math.round((event.loaded / event.total) * 100));
        },
      });

      return response.data;
    },
    onSuccess: (resume) => {
      queryClient.setQueryData<ResumeType[]>(resumeQueryKeys.getResumes(), (currentResumes) => [
        ...(currentResumes ?? []),
        resume,
      ]);
      trackEvent(GA_EVENT.uploadResume);
      toast.success('이력서가 저장되었습니다.');
    },
    onError: () => {
      toast.error('이력서 업로드에 실패했습니다.');
    },
  });
};
