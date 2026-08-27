'use client';

import { type ApiResponseType, post } from '@chup/core/shared';
import { toast } from '@chup/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { isPayloadTooLargeError } from '@/shared/lib/isPayloadTooLargeError';

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
      toast.success('이력서가 저장되었습니다.');
    },
    onError: (error) => {
      toast.error(
        isPayloadTooLargeError(error)
          ? '파일 크기가 너무 큽니다. 20MB 이하의 파일만 업로드할 수 있습니다.'
          : '이력서 업로드에 실패했습니다.',
      );
    },
  });
};
